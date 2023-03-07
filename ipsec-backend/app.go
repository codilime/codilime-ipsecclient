/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package main

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"ipsec_backend/config"
	"ipsec_backend/db"
	"ipsec_backend/ipsecclient_yang"
	"ipsec_backend/logger"
	"net/http"
	"os"
	"os/exec"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/foomo/htpasswd"
	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
	"github.com/openconfig/ygot/ygot"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

const (
	restconfBasePath         = "/restconf/data/ipsecclient:api"
	vrfPath                  = restconfBasePath + "/vrf"
	vrfIDPath                = vrfPath + "={id:[0-9]+}"
	monitoringPath           = restconfBasePath + "/monitoring={id:[0-9]+}"
	sourceInterfacePath      = restconfBasePath + "/source-interface"
	algorithmPath            = restconfBasePath + "/algorithm"
	logPath                  = restconfBasePath + "/log"
	errorPath                = restconfBasePath + "/error"
	CAPath                   = restconfBasePath + "/ca"
	settingNamePath          = restconfBasePath + "/setting={name:[a-zA-Z0-9-_]+}"
	passPath                 = restconfBasePath + "/password"
	checkSwitchBasicAuthPath = restconfBasePath + "/check-switch-basic-auth"
	changeLogLevelPath       = restconfBasePath + "/dev-log-level={level:[a-zA-Z0-9-_]+}"

	pkcs12Path = "/pkcs12/{id:[0-9]+}"

	nginxPasswordFile = "/etc/nginx/htpasswd"
	username          = "admin"
	CAsDir            = "/opt/ipsec/x509ca"

	lastLogBytes = 65536
)

type App struct {
	router            *mux.Router
	db                db.DBinterface
	softwareGenerator config.SoftwareGeneratorInt
	hardwareGenerator config.HardwareGeneratorInt
	devlog *log.Logger
}

func (a *App) ensureHWVRF() error {
	a.devlog.Debug("ensureHWVRF invoked")

	hwVrf := db.Vrf{
		ID:         db.HardwareVrfID,
		ClientName: "hardware",
		CryptoPh1:  []byte("[\"aes-cbc-128\", \"sha256\", \"fourteen\"]"),
		CryptoPh2:  []byte("[\"esp-aes\", \"esp-sha-hmac\", \"group14\"]"),
		Active:     db.BoolPointer(nil),
		Endpoints:  []db.Endpoint{},
		Vlans:      []byte("[]"),
	}
	err := a.db.Create(&hwVrf)
	if err == nil {
		return nil
	}

	if strings.Contains(err.Error(),
		"UNIQUE constraint failed: vrfs.id") {
		return nil
	}

	return logger.LogErrorReturnFirst(a.devlog, err)
}

func NewApp(dbInstance db.DBinterface, softwareGenerator config.SoftwareGeneratorInt,
	hardwareGenerator config.HardwareGeneratorInt, switchCreds db.SwitchCreds, devlog *log.Logger) (*App, error) {
	devlog.Debug("NewApp invoked")

	app := new(App)

	app.db = dbInstance
	app.devlog = devlog
	app.softwareGenerator = softwareGenerator
	app.hardwareGenerator = hardwareGenerator
	app.initializeRoutes()
	if err := app.initializeSettings(switchCreds); err != nil {
		return nil, logger.LogErrorReturnFirst(devlog, err)
	}

	if err := app.ensureHWVRF(); err != nil {
		return nil, logger.LogErrorReturnFirst(devlog, err)
	}

	devlog.Info("NewApp created")

	return app, nil
}

func (a *App) initializeSettings(switchCreds db.SwitchCreds) error {
	a.devlog.Debug("initializeSettings invoked")

	password := "cisco123"
	if err := htpasswd.SetPassword(nginxPasswordFile, username, password, htpasswd.HashBCrypt); err != nil {
		return logger.LogErrorReturnFirst(a.devlog, err)
	}

	model, err := a.hardwareGenerator.GetSwitchModel(switchCreds)
	if err != nil {
		return logger.LogErrorReturnFirst(a.devlog, err)
	}

	err = a.db.SetSetting(password, "switch_username", switchCreds.Username)
	if err != nil {
		return logger.LogErrorReturnFirst(a.devlog, err)
	}

	err = a.db.SetSetting(password, "switch_password", switchCreds.Password)
	if err != nil {
		return logger.LogErrorReturnFirst(a.devlog, err)
	}

	err = a.db.SetSetting(password, "system_name", model)
	if err != nil {
		return logger.LogErrorReturnFirst(a.devlog, err)
	}

	err = a.db.SetSetting(password, "app_version", os.Getenv("APP_VERSION"))
	if err != nil {
		return logger.LogErrorReturnFirst(a.devlog, err)
	}

	err = a.db.SetSetting(password, "switch_address", switchCreds.SwitchAddress)
	if err != nil {
		return logger.LogErrorReturnFirst(a.devlog, err)
	}

	return nil
}

func (a *App) _changePassword(oldPass, newPass string) error {
	a.devlog.Debug("_changePassword invoked")
	if err := htpasswd.SetPassword(nginxPasswordFile, username, newPass, htpasswd.HashBCrypt); err != nil {
		return logger.LogErrorReturnFirst(a.devlog, err)
	}

	cmd := exec.Command("nginx", "-s", "reload")
	if _, err := cmd.Output(); err != nil {
		return logger.LogErrorReturnFirst(a.devlog, err)
	}

	return logger.LogErrorReturnFirst(a.devlog, a.db.ChangePassword(oldPass, newPass))
}

func (a *App) Run(addr string) {
	a.devlog.Debug("Run invoked")
	logger.Fatal(a.devlog, http.ListenAndServe(addr, a.router))
}

func (a *App) initializeRoutes() {
	a.devlog.Debug("initializeRoutes invoked")
	a.router = mux.NewRouter()
	a.router.HandleFunc(vrfPath, a.getVrfs).Methods(http.MethodGet)
	a.router.HandleFunc(vrfPath, a.createVrf).Methods(http.MethodPost)
	a.router.HandleFunc(vrfIDPath, a.getVrf).Methods(http.MethodGet)
	a.router.HandleFunc(vrfIDPath, a.updateVrf).Methods(http.MethodPatch)
	a.router.HandleFunc(vrfIDPath, a.deleteVrf).Methods(http.MethodDelete)
	a.router.HandleFunc(monitoringPath, a.monitoring).Methods(http.MethodGet)
	a.router.HandleFunc(sourceInterfacePath, a.getSourceInterfaces).Methods(http.MethodGet)
	a.router.HandleFunc(algorithmPath, a.getAlgorithms).Methods(http.MethodGet)
	a.router.HandleFunc(logPath, a.getLogs).Methods(http.MethodGet)
	a.router.HandleFunc(errorPath, a.getErrors).Methods(http.MethodGet)
	a.router.HandleFunc(settingNamePath, a.apiGetSetting).Methods(http.MethodGet)
	a.router.HandleFunc(settingNamePath, a.apiSetSetting).Methods(http.MethodPost)
	a.router.HandleFunc(passPath, a.changePassword).Methods(http.MethodPost)
	a.router.HandleFunc(checkSwitchBasicAuthPath, a.checkSwitchBasicAuth).Methods(http.MethodGet)
	a.router.HandleFunc(CAPath, a.setCAs).Methods(http.MethodPost)
	a.router.HandleFunc(CAPath, a.getCAs).Methods(http.MethodGet)
	a.router.HandleFunc(pkcs12Path, a.getPkcs12).Methods(http.MethodGet)
}

func getPassFromHeader(devlog *log.Logger, header http.Header) (string, error) {
	authHeader := header["Authorization"]
	if len(authHeader) == 0 {
		return "", logger.ReturnNewError(devlog,"no basic auth")
	}

	prefixLen := len("Basic ")
	based := strings.TrimRight(authHeader[0][prefixLen:], "=")
	decodedBasicAuth, err := base64.RawStdEncoding.DecodeString(based)
	if err != nil {
		return "", logger.LogErrorReturnFirst(devlog, err)
	}

	return strings.Split(string(decodedBasicAuth), ":")[1], nil
}

func (a *App) changePassword(w http.ResponseWriter, r *http.Request) {
	a.devlog.Debug("changePassword invoked")

	oldPass, err := getPassFromHeader(a.devlog, r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	api := ipsecclient_yang.Ipsecclient_Api{}
	err = ipsecclient_yang.Unmarshal(body, &api)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	if err := api.Validate(); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err)
		return
	}

	if err := a._changePassword(oldPass, *api.Password); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	log.Info("password changed")
	log.Debug(fmt.Sprintf("password changed from %s to %s", oldPass, *api.Password))

	respondWithJSON(a.devlog, w, http.StatusNoContent, nil)
}

func (a *App) getPkcs12(w http.ResponseWriter, r *http.Request) {
	a.devlog.Debug("getPkcs12 invoked")

	endpointID, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	hwVrf := db.Vrf{ID: db.HardwareVrfID}
	if err := a.db.GetVrf(&hwVrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	decBytes, err := base64.RawStdEncoding.WithPadding('=').DecodeString(hwVrf.EndpointByID(uint32(endpointID)).Authentication.Pkcs12Base64)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	w.Header().Set("Content-Type", "application/octet-stream")
	w.WriteHeader(http.StatusOK)
	w.Write(decBytes)
}

func ClearCAs(devlog *log.Logger) error {
	devlog.Debug("ClearCAs invoked")

	dir, err := ioutil.ReadDir(CAsDir)
	if err != nil {
		return logger.LogErrorReturnFirst(devlog, err)
	}

	for _, d := range dir {
		err := os.RemoveAll(path.Join([]string{CAsDir, d.Name()}...))
		if err != nil {
			return err
		}
	}

	return nil
}

func writeCAs(devlog *log.Logger, cas []db.CertificateAuthority) error {
	devlog.Debug("writeCAs invoked")

	if err := ClearCAs(devlog); err != nil {
		return logger.LogErrorReturnFirst(devlog, err)
	}

	for _, ca := range cas {
		err := ioutil.WriteFile(fmt.Sprintf("%s/%d.pem", CAsDir, ca.ID), []byte(ca.CA), 0644)
		if err != nil {
			return err
		}
	}

	return nil
}

func (a *App) setCAs(w http.ResponseWriter, r *http.Request) {
	a.devlog.Debug("setCAs invoked")

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	api := ipsecclient_yang.Ipsecclient_Api{}
	err = ipsecclient_yang.Unmarshal(body, &api, nil)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	if err := api.Validate(); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err)
		return
	}

	cas := []db.CertificateAuthority{}
	for _, caYang := range api.Ca {
		ca := db.CertificateAuthority{}
		ca.FromYang(caYang)
		cas = append(cas, ca)
	}

	if err := a.db.DeleteCAs(); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	if len(cas) > 0 {
		if err := a.db.Create(&cas); err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err)
			return
		}
	}

	if err := writeCAs(a.devlog, cas); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	log.Info("Set CAs completed")
	logger.ApiAndDevLog(a.devlog, (fmt.Sprintf("Set CAs completed|CAs: %v", cas)), log.DebugLevel)

	respondWithJSON(a.devlog, w, http.StatusNoContent, nil)
}

func (a *App) getCAs(w http.ResponseWriter, r *http.Request) {
	a.devlog.Debug("get CAs invoked")
	cas, err := a.db.GetCAs()
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	api := ipsecclient_yang.Ipsecclient_Api{
		Ca: map[uint32]*ipsecclient_yang.Ipsecclient_Api_Ca{},
	}

	for _, ca := range cas {
		api.Ca[ca.ID] = ca.ToYang()
	}

	json, err := ygot.EmitJSON(&api, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	logger.ApiAndDevLog(a.devlog, (fmt.Sprintf("get CAs completed|CAs: %v", cas)), log.DebugLevel)

	respondWithMarshalledJSON(a.devlog, w, http.StatusOK, json)
}

func (a *App) apiSetSetting(w http.ResponseWriter, r *http.Request) {
	a.devlog.Debug("apiSetSetting invoked")

	name := mux.Vars(r)["name"]
	if name == "masterpass" {
		a.respondWithError(w, http.StatusBadRequest, errors.New("masterpass cannot be used as a setting name"))
		return
	}

	key, err := getPassFromHeader(a.devlog, r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	j := map[string]interface{}{}
	if err := json.Unmarshal(body, &j); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err)
		return
	}

	settingJson, err := json.Marshal(j["setting"])
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, err)
		return
	}

	setting := ipsecclient_yang.Ipsecclient_Api_Setting{}
	if err := ipsecclient_yang.Unmarshal(settingJson, &setting); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err)
		return
	}

	if err := setting.Validate(); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err)
		return
	}

	if err := a.db.SetSetting(key, name, *setting.Value); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	if name == "switch_address" {
		exec.Command("ip", "rule", "del", "pref", "2000").Output()
		exec.Command("ip", "rule", "add", "to", *setting.Value, "table", "1701", "pref", "2000").Output()
	}

	log.Info(fmt.Sprintf("Setting %s set", name))
	logger.ApiAndDevLog(a.devlog, fmt.Sprintf("Setting %s set to %s", name, *setting.Value), log.DebugLevel)

	respondWithJSON(a.devlog, w, http.StatusCreated, nil)
}

func (a *App) apiGetSetting(w http.ResponseWriter, r *http.Request) {
	a.devlog.Debug("apiGetSetting invoked")

	name := mux.Vars(r)["name"]
	if name == "masterpass" {
		a.respondWithError(w, http.StatusBadRequest, errors.New("masterpass cannot be used as a setting name"))
		return
	}

	key, err := getPassFromHeader(a.devlog, r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err)
		return
	}

	value, err := a.db.GetSetting(key, name)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	setting := ipsecclient_yang.Ipsecclient_Api_Setting{
		Name:  db.StringPointer(name),
		Value: db.StringPointer(value),
	}
	json, err := ygot.EmitJSON(&setting, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	log.Info(fmt.Sprintf("Getting %s setting", name))
	logger.ApiAndDevLog(a.devlog, fmt.Sprintf("Setting %s = %s received", name, *setting.Value), log.DebugLevel)

	respondWithMarshalledJSON(a.devlog, w, http.StatusOK, `{"setting":`+json+"}")
}

func (a *App) getVrfs(w http.ResponseWriter, r *http.Request) {
	a.devlog.Debug("getVrfs invoked")

	vrfsMap := map[string]*ipsecclient_yang.Ipsecclient_Api_Vrf{}
	vrfs, err := a.db.GetVrfs()
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	key, err := getPassFromHeader(a.devlog, r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err)
		return
	}

	for _, v := range vrfs {
		if err := a.db.DecryptPSK(key, &v); err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err)
			return
		}
		vrfYang, err := v.ToYang()
		if err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err)
			return
		}
		vrfsMap[v.ClientName] = vrfYang
	}

	api := ipsecclient_yang.Ipsecclient_Api{
		Vrf: vrfsMap,
	}

	json, err := ygot.EmitJSON(&api, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	log.Info("Vrfs received")
	logger.ApiAndDevLog(a.devlog, fmt.Sprintf("Vrfs %v", vrfs), log.DebugLevel)

	respondWithMarshalledJSON(a.devlog, w, http.StatusOK, json)
}

func (a *App) getVrf(w http.ResponseWriter, r *http.Request) {
	a.devlog.Debug("get Vrf invoked")

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, errors.New("invalid vrf ID"))
		return
	}

	vrf := db.Vrf{ID: uint32(id)}
	if err := a.db.GetVrf(&vrf); err != nil {
		switch err {
		case gorm.ErrRecordNotFound:
			a.respondWithError(w, http.StatusNotFound, errors.New("vrf not found"))
		default:
			a.respondWithError(w, http.StatusInternalServerError, err)
		}

		return
	}

	key, err := getPassFromHeader(a.devlog, r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err)

		return
	}

	if err := a.db.DecryptPSK(key, &vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	vrfYang, err := vrf.ToYang()
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	json, err := ygot.EmitJSON(vrfYang, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	log.Debugf("Get vrf: %v", vrf)


	respondWithMarshalledJSON(a.devlog, w, http.StatusOK, `{"vrf":`+json+`}`)
}

func vrfUpdateValid(devlog *log.Logger, vrf db.Vrf) (bool, error) {
	if vrf.ID == db.HardwareVrfID {
		return true, nil
	}

	return vrfValid(devlog, vrf)
}

func vrfCreateValid(devlog *log.Logger, vrf db.Vrf) (bool, error) {
	if vrf.ID == db.HardwareVrfID {
		return false, nil
	}

	return vrfValid(devlog, vrf)
}

func vrfValid(devlog *log.Logger, vrf db.Vrf) (bool, error) {
	devlog.Debug("vrfValid invoked")

	if vrf.PhysicalInterface == "" {
		return false, nil
	}

	vlans, err := vrf.GetVlans()
	if err != nil {
		return false, logger.LogErrorReturnFirst(devlog, err)
	}

	for _, v := range vlans {
		if v.Vlan <= 0 {
			return false, nil
		}
	}

	for _, e := range vrf.Endpoints {
		if vrf.DisablePeerIps != nil && *vrf.DisablePeerIps && e.BGP {
			return false, nil
		}
	}

	return true, nil
}

func (a *App) _updateBackends(key string, vrf, oldVrf *db.Vrf) error {
	a.devlog.Debug("_updateBackends invoked")
	// save and retrieve the vrf to update the endpoints ids
	if err := a.db.EncryptPSK(key, vrf); err != nil {
		return logger.LogErrorReturnFirst(a.devlog, err)
	}

	if err := a.db.UpdateVrf(vrf); err != nil {
		return logger.LogErrorReturnFirst(a.devlog, err)
	}
	if err := a.db.GetVrf(vrf); err != nil {
		return logger.LogErrorReturnFirst(a.devlog, err)
	}

	if err := a.db.DecryptPSK(key, vrf); err != nil {
		return logger.LogErrorReturnFirst(a.devlog, err)
	}

	// handle backends
	if *oldVrf.Active != *vrf.Active {
		if *vrf.Active {
			if err := a.generateConfigs(key, *vrf); err != nil {
				return logger.LogErrorReturnFirst(a.devlog, err)
			}
		} else {
			if err := a.deleteConfigs(key, *oldVrf); err != nil {
				return logger.LogErrorReturnFirst(a.devlog, err)
			}
		}
	} else if *vrf.Active {
		if err := a.deleteConfigs(key, *oldVrf); err != nil {
			return logger.LogErrorReturnFirst(a.devlog, err)
		}
		if err := a.generateConfigs(key, *vrf); err != nil {
			return logger.LogErrorReturnFirst(a.devlog, err)
		}
	}

	return nil
}

func vrfSubJsonValidSW(devlog *log.Logger, vrfSubJson interface{}) error {
	devlog.Debug("vrfSubJsonValidSW invoked")

	vrf, ok := vrfSubJson.(map[string]interface{})
	if !ok {
		return logger.ReturnNewError(devlog, "wrong vrfSubJson type")
	}

	isBGP, err := verifyEndpoints(devlog, vrf)
	if err != nil {
		return err
	}

	if isBGP {
		localAS, ok := vrf["local_as"].(float64)
		if !ok {
			return logger.ReturnNewError(devlog, "no local_as or wrong type")
		}
		if localAS == 0 {
			return logger.ReturnNewError(devlog, "local_as cannot be 0")
		}
	}

	vlans, ok := vrf["vlan"]
	if !ok {
		return logger.ReturnNewError(devlog, "no vlans")
	}

	vlansList, ok := vlans.([]interface{})
	if !ok {
		return logger.ReturnNewError(devlog, "wrong vlans type")
	}

	vlanIds := map[float64]int{}
	for _, v := range vlansList {
		vlan := v.(map[string]interface{})
		if !ok {
			return logger.ReturnNewError(devlog, "wrong vlan type")
		}

		vlanId, ok := vlan["vlan"]
		if !ok {
			return logger.ReturnNewError(devlog, "no vlan id")
		}

		vlanIdFloat, ok := vlanId.(float64)
		if !ok {
			return logger.ReturnNewError(devlog, "wrong vlan id type")
		}

		vlanIds[vlanIdFloat]++
		if vlanIds[vlanIdFloat] > 1 {
			return logger.ReturnNewError(devlog, fmt.Sprintf("vlan %d appears more than once, %d times", int(vlanIdFloat), vlanIds[vlanIdFloat]))
		}
	}

	return nil
}

func vrfSubJsonValidHW(devlog *log.Logger, vrfSubJson interface{}) error {
	devlog.Debug("vrfSubJsonValidHW invoked")
	vrf, ok := vrfSubJson.(map[string]interface{})
	if !ok {
		return logger.ReturnNewError(devlog, "wrong vrfSubJson type")
	}

	_, err := verifyEndpoints(devlog, vrf)

	return err
}

func verifyEndpoints(devlog *log.Logger, vrf map[string]interface{}) (bool, error) {
	devlog.Debug("verifyEndpoints invoked")

	endpointInt, ok := vrf["endpoint"]
	if !ok {
		return false, nil
	}

	endpoints, ok := endpointInt.([]interface{})
	if !ok {
		return false, logger.ReturnNewError(devlog, "wrong endpoints json type")
	}

	isBGP := false
	for _, e := range endpoints {
		if e, ok := e.(map[string]interface{}); ok {
			local_ip, ok := e["local_ip"].(string)
			if ok && strings.Contains(local_ip, ":") {
				return false, logger.ReturnNewError(devlog, "endpoint local ip: IPv6 not supported")
			}

			peer_ip, ok := e["peer_ip"].(string)
			if ok && strings.Contains(peer_ip, ":") {
				return false, logger.ReturnNewError(devlog, "endpoint peer ip: IPv6 not supported")
			}

			bgp, ok := e["bgp"].(bool)
			if ok {
				isBGP = isBGP || bgp
			}

		} else {
			return false, logger.ReturnNewError(devlog, "wrong endpoint json type")
		}
	}

	return isBGP, nil
}

func (a *App) createVrf(w http.ResponseWriter, r *http.Request) {
	a.devlog.Debug("createVrf invoked")

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	j := map[string]interface{}{}
	if err := json.Unmarshal(body, &j); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err)
		return
	}

	vrfSubJson, ok := j["vrf"]
	if !ok {
		a.respondWithError(w, http.StatusBadRequest, errors.New("malformed json"))
		return
	}

	if err := vrfSubJsonValidSW(a.devlog, vrfSubJson); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err)
		return
	}

	vrfJson, err := json.Marshal(vrfSubJson)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, err)
		return
	}

	yangVrf := ipsecclient_yang.Ipsecclient_Api_Vrf{}
	if err := ipsecclient_yang.Unmarshal(vrfJson, &yangVrf); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err)
		return
	}

	if err := yangVrf.Validate(); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err)
		return
	}

	vrf := db.Vrf{}
	vrf.FromYang(&yangVrf)
	valid, err := vrfCreateValid(a.devlog, vrf)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	if !valid {
		a.respondWithError(w, http.StatusBadRequest, errors.New("vrf invalid"))
		return
	}

	if vrf.Active == nil {
		vrf.Active = new(bool)
	}

	key, err := getPassFromHeader(a.devlog, r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err)
		return
	}

	if err := a.db.EncryptPSK(key, &vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	if err := a.db.Create(&vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	if err := a.db.DecryptPSK(key, &vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	if err := a._updateBackends(key, &vrf, &db.Vrf{
		ID:     vrf.ID,
		Active: db.BoolPointer(nil),
	}); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	log.Info("Vrf created")
	logger.ApiAndDevLog(a.devlog, fmt.Sprintf("vrf %v created", vrf), log.DebugLevel)

	if len(r.Header["Origin"]) < 1 {
		w.Header().Set("Location", fmt.Sprintf("%s=%d", vrfPath, vrf.ID))
	} else {
		w.Header().Set("Location", fmt.Sprintf("%s%s=%d", r.Header["Origin"][0], vrfPath, vrf.ID))
	}

	respondWithJSON(a.devlog, w, http.StatusCreated, nil)
}

func (a *App) updateVrf(w http.ResponseWriter, r *http.Request) {
	a.devlog.Debug("updateVrf invoked")

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, errors.New("invalid vrf ID"))

		return
	}

	body, err := ioutil.ReadAll(r.Body)
	log.Debugf("update vrf request %s\n", body)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	j := map[string]interface{}{}
	if err := json.Unmarshal(body, &j); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err)

		return
	}

	vrfSubJson, ok := j["vrf"]
	if !ok {
		a.respondWithError(w, http.StatusBadRequest, errors.New("malformed json"))

		return
	}

	if id != db.HardwareVrfID {
		if err := vrfSubJsonValidSW(a.devlog, vrfSubJson); err != nil {
			a.respondWithError(w, http.StatusBadRequest, err)

			return
		}
	} else {
		if err := vrfSubJsonValidHW(a.devlog, vrfSubJson); err != nil {
			a.respondWithError(w, http.StatusBadRequest, err)

			return
		}
	}

	vrfJson, err := json.Marshal(vrfSubJson)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, err)

		return
	}

	yangVrf := ipsecclient_yang.Ipsecclient_Api_Vrf{}
	if err := ipsecclient_yang.Unmarshal(vrfJson, &yangVrf); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err)

		return
	}

	if err := yangVrf.Validate(); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err)

		return
	}

	key, err := getPassFromHeader(a.devlog, r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err)

		return
	}

	vrf := db.Vrf{}
	vrf.ID = uint32(id)
	vrf.FromYang(&yangVrf)

	valid, err := vrfUpdateValid(a.devlog, vrf)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	if !valid {
		a.respondWithError(w, http.StatusBadRequest, errors.New("vrf invalid"))

		return
	}

	var oldVrf db.Vrf
	oldVrf.ID = uint32(id)

	if err := a.db.GetVrf(&oldVrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	if vrf.ID == db.HardwareVrfID && vrf.ClientName != oldVrf.ClientName {
		// can't change the hardware vrf name
		a.respondWithError(w, http.StatusBadRequest, errors.New("Cannot change the hardware vrf name"))

		return
	}

	if vrf.Active == nil {
		vrf.Active = oldVrf.Active
	}

	if err := a._updateBackends(key, &vrf, &oldVrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	log.Info("Vrf updated")
	logger.ApiAndDevLog(a.devlog, fmt.Sprintf("vrf updated old vrf %v, new vrf %v", vrf, oldVrf), log.DebugLevel)
	

	respondWithJSON(a.devlog, w, http.StatusNoContent, nil)
}

func (a *App) getSwitchCreds(key string) (*db.SwitchCreds, error) {
	a.devlog.Debug("getSwitchCreds invoked")

	var err error
	username, err := a.db.GetSetting(key, "switch_username")
	if err != nil {
		return nil, logger.LogErrorReturnFirst(a.devlog, err)
	}

	password, err := a.db.GetSetting(key, "switch_password")
	if err != nil {
		return nil, logger.LogErrorReturnFirst(a.devlog, err)
	}

	switchAddress, err := a.db.GetSetting(key, "switch_address")
	if err != nil {
		return nil, logger.LogErrorReturnFirst(a.devlog, err)
	}

	whenEspHmac, err := a.db.GetSetting(key, "when_esp_hmac")
	if err != nil {
		whenEspHmac = ""
	}

	return &db.SwitchCreds{Username: username, Password: password, SwitchAddress: switchAddress, WhenEspHmac: whenEspHmac}, nil
}

func (a *App) generateConfigs(key string, vrf db.Vrf) error {
	a.devlog.Debug("generateConfigs invoked")

	if vrf.ID == db.HardwareVrfID {
		_, err := a._getAlgorithms(key)
		if err != nil {
			return err
		}

		switchCreds, err := a.getSwitchCreds(key)
		if err != nil {
			return err
		}

		return a.hardwareGenerator.GenerateConfigs(vrf, *switchCreds)
	} else {
		return a.softwareGenerator.GenerateConfigs(vrf)
	}
}

func (a *App) deleteConfigs(key string, vrf db.Vrf) error {
	a.devlog.Debug("deleteConfigs invoked")

	if vrf.ID == db.HardwareVrfID {
		_, err := a._getAlgorithms(key)
		if err != nil {
			return err
		}

		switchCreds, err := a.getSwitchCreds(key)
		if err != nil {
			return err
		}

		return a.hardwareGenerator.DeleteConfigs(vrf, *switchCreds)
	} else {
		return a.softwareGenerator.DeleteConfigs(vrf)
	}
}

func (a *App) deleteVrf(w http.ResponseWriter, r *http.Request) {
	a.devlog.Debug("deleteVrf invoked")

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, errors.New("invalid Vrf ID"))

		return
	}

	key, err := getPassFromHeader(a.devlog, r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err)

		return
	}

	vrf := db.Vrf{ID: uint32(id)}
	if err := a.db.GetVrf(&vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	err = a.deleteConfigs(key, vrf)
	if err != nil {
		logger.LogErrorReturnFirst(a.devlog, err)
		a.db.DeleteVrf(&vrf)
		err = nil
		if id == db.HardwareVrfID {
			err = a.ensureHWVRF()
		}
	}

	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
	}

	log.Info("Vrf deleted")
	logger.ApiAndDevLog(a.devlog, fmt.Sprintf("vrf %v deleted", vrf), log.DebugLevel)

	respondWithJSON(a.devlog, w, http.StatusNoContent, nil)
}

func min(a, b int64) int64 {
	if a < b {
		return a
	}

	return b
}

func getLastBytesOfFile(devlog *log.Logger, fname string, maxBytes int64) ([]byte, error) {
	file, err := os.Open(fname)
	if err != nil {
		return nil, logger.LogErrorReturnFirst(devlog, err)
	}

	defer file.Close()

	stat, err := os.Stat(fname)
	if err != nil {
		return nil, logger.LogErrorReturnFirst(devlog, err)
	}

	bytes := min(maxBytes, stat.Size())
	buf := make([]byte, bytes)
	start := stat.Size() - bytes
	_, err = file.ReadAt(buf, start)
	if err != nil {
		return nil, logger.LogErrorReturnFirst(devlog, err)
	}

	return buf, nil
}

func (a *App) getLogs(w http.ResponseWriter, r *http.Request) {
	processInfos, err := config.GetProcessInfos()
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	api := ipsecclient_yang.Ipsecclient_Api{
		Log: map[string]*ipsecclient_yang.Ipsecclient_Api_Log{},
	}

	for _, info := range processInfos {
		log, err := getLastBytesOfFile(a.devlog, info.StdoutLogfile, lastLogBytes)
		if err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err)

			return
		}

		api.Log[info.Name] = &ipsecclient_yang.Ipsecclient_Api_Log{
			Name: db.StringPointer(info.Name),
			Log:  db.StringPointer(string(log)),
		}

		log, err = getLastBytesOfFile(a.devlog, "opt/logs/dev.log", lastLogBytes)
		if err != nil {
			return
		}

		api.Log["dev"] = &ipsecclient_yang.Ipsecclient_Api_Log{
			Name: db.StringPointer("dev"),
			Log:  db.StringPointer(string(log)),
		}
	}

	json, err := ygot.EmitJSON(&api, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	respondWithMarshalledJSON(a.devlog, w, http.StatusOK, json)
}

func (a *App) getErrors(w http.ResponseWriter, r *http.Request) {
	a.devlog.Debug("getErrors invoked")

	storedErrors, err := a.db.GetStoredErrors()
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	yangErrors := []*ipsecclient_yang.Ipsecclient_Api_Error{}
	for _, storedError := range storedErrors {
		yangErrors = append(yangErrors, storedError.ToYang())
	}

	api := ipsecclient_yang.Ipsecclient_Api{
		Error: yangErrors,
	}

	json, err := ygot.EmitJSON(&api, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	respondWithMarshalledJSON(a.devlog, w, http.StatusOK, json)
}

func (a *App) getSourceInterfaces(w http.ResponseWriter, r *http.Request) {
	a.devlog.Debug("getSourceInterfaces invoked")

	key, err := getPassFromHeader(a.devlog, r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err)

		return
	}

	switchCreds, err := a.getSwitchCreds(key)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	sourceInterfaces, err := config.GetSourceInterfaces(*switchCreds)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	api := ipsecclient_yang.Ipsecclient_Api{
		SourceInterface: db.SourceInterfacesToYang(sourceInterfaces),
	}

	json, err := ygot.EmitJSON(&api, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	respondWithMarshalledJSON(a.devlog, w, http.StatusOK, json)
}

func (a *App) _getAlgorithms(key string) (db.Algorithm, error) {
	a.devlog.Debug("_getAlgorithms invoked")
	algorithms := db.Algorithm{}
	whenEspHmac := ""
	if err := a.db.GetAlgorithms(&algorithms); err != nil {
		switchCreds, err := a.getSwitchCreds(key)
		if err != nil {
			return algorithms, err
		}

		algorithms, whenEspHmac, err = config.GetAlgorithms(*switchCreds)
		if err != nil {
			return algorithms, err
		}

		a.db.SetSetting(key, "when_esp_hmac", whenEspHmac)
		if err != nil {
			return algorithms, err
		}

		err = a.db.Create(&algorithms)
		if err != nil {
			return algorithms, err
		}
	}

	return algorithms, nil
}

func (a *App) getAlgorithms(w http.ResponseWriter, r *http.Request) {
	a.devlog.Debug("getAlgorithms invoked")

	key, err := getPassFromHeader(a.devlog, r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err)
		return
	}

	algorithms, err := a._getAlgorithms(key)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	api := ipsecclient_yang.Ipsecclient_Api{
		Algorithm: db.AlgorithmsToYang(algorithms),
	}

	json, err := ygot.EmitJSON(&api, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	log.Info("Algorithms received")
	a.devlog.Debug("Algorithms: %v", algorithms)

	respondWithMarshalledJSON(a.devlog, w, http.StatusOK, json)
}

func (a *App) checkSwitchBasicAuth(w http.ResponseWriter, r *http.Request) {
	key, err := getPassFromHeader(a.devlog, r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err)
		return
	}

	switchCreds, err := a.getSwitchCreds(key)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	isValid, err := a.hardwareGenerator.CheckSwitchBasicAuth(*switchCreds)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)

		return
	}

	if isValid {
		model, err := a.hardwareGenerator.GetSwitchModel(*switchCreds)
		if err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err)
		}

		a.db.SetSetting(key, "system_name", model)
	}

	api := ipsecclient_yang.Ipsecclient_Api{
		CheckSwitchBasicAuth: db.BoolPointer(&isValid),
	}

	json, err := ygot.EmitJSON(&api, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	respondWithMarshalledJSON(a.devlog, w, http.StatusOK, json)
}

func respondWithMarshalledJSON(devlog *log.Logger, w http.ResponseWriter, code int, response string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if _, err := w.Write([]byte(response)); err != nil {
		logger.ReturnNewError(devlog, "writing the response: "+err.Error())
	}
}

func (a *App) respondWithError(w http.ResponseWriter, code int, err error) {
	err = logger.ReturnErrorEx(a.devlog, 2,  err)
	a.storeError(err.Error())

	respondWithJSON(a.devlog, w, code, map[string]string{"result": "error", "error": err.Error()})
}

func (a *App) storeError(message string) {
	newError := db.StoredError{Message: message, ErrorTime: time.Now()}

	a.db.RotateErrorsBySizeOrDate()
	a.db.Create(&newError)
}

func respondWithJSON(devlog *log.Logger, w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if payload != nil {
		if _, err := w.Write(response); err != nil {
			logger.ReturnNewError(devlog, "writing the response: "+err.Error())
		}
	}
}
