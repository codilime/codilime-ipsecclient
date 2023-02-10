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
	"github.com/sirupsen/logrus"
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
	log               *logrus.Logger
}

func (a *App) ensureHWVRF() error {
	a.log.Info("ensureHWVRF invoked")

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

	return logger.LogErrorReturnFirst(a.log, err)
}

func NewApp(dbInstance db.DBinterface, softwareGenerator config.SoftwareGeneratorInt,
	hardwareGenerator config.HardwareGeneratorInt, switchCreds db.SwitchCreds, log *logrus.Logger) (*App, error) {
	log.Info("NewApp invoked")

	app := new(App)

	app.db = dbInstance
	app.log = log
	app.softwareGenerator = softwareGenerator
	app.hardwareGenerator = hardwareGenerator
	app.initializeRoutes()
	if err := app.initializeSettings(switchCreds); err != nil {
		return nil, logger.LogErrorReturnFirst(log, err)
	}

	if err := app.ensureHWVRF(); err != nil {
		return nil, logger.LogErrorReturnFirst(log, err)
	}

	log.Info("NewApp created")

	return app, nil
}

func (a *App) initializeSettings(switchCreds db.SwitchCreds) error {
	a.log.Info("initializeSettings invoked")

	password := "cisco123"
	if err := htpasswd.SetPassword(nginxPasswordFile, username, password, htpasswd.HashBCrypt); err != nil {
		return logger.LogErrorReturnFirst(a.log, err)
	}

	model, err := a.hardwareGenerator.GetSwitchModel(switchCreds)
	if err != nil {
		return logger.LogErrorReturnFirst(a.log, err)
	}

	err = a.db.SetSetting(password, "switch_username", switchCreds.Username)
	if err != nil {
		return logger.LogErrorReturnFirst(a.log, err)
	}

	err = a.db.SetSetting(password, "switch_password", switchCreds.Password)
	if err != nil {
		return logger.LogErrorReturnFirst(a.log, err)
	}

	err = a.db.SetSetting(password, "system_name", model)
	if err != nil {
		return logger.LogErrorReturnFirst(a.log, err)
	}

	err = a.db.SetSetting(password, "app_version", os.Getenv("APP_VERSION"))
	if err != nil {
		return logger.LogErrorReturnFirst(a.log, err)
	}

	err = a.db.SetSetting(password, "switch_address", switchCreds.SwitchAddress)
	if err != nil {
		return logger.LogErrorReturnFirst(a.log, err)
	}

	return nil
}

func (a *App) _changePassword(oldPass, newPass string) error {
	a.log.Info("_changePassword invoked")
	if err := htpasswd.SetPassword(nginxPasswordFile, username, newPass, htpasswd.HashBCrypt); err != nil {
		return logger.LogErrorReturnFirst(a.log, err)
	}

	cmd := exec.Command("nginx", "-s", "reload")
	if _, err := cmd.Output(); err != nil {
		return logger.LogErrorReturnFirst(a.log, err)
	}

	return logger.LogErrorReturnFirst(a.log, a.db.ChangePassword(oldPass, newPass))
}

func (a *App) Run(addr string) {
	a.log.Info("Run invoked")
	logger.Fatal(a.log, http.ListenAndServe(addr, a.router))
}

func (a *App) initializeRoutes() {
	a.log.Info("initializeRoutes invoked")
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

func getPassFromHeader(header http.Header, log *logrus.Logger) (string, error) {
	log.Info("getPassFromHeader invoked")
	authHeader := header["Authorization"]
	if len(authHeader) == 0 {
		return "", logger.ReturnNewError("no basic auth", log)
	}

	prefixLen := len("Basic ")
	based := strings.TrimRight(authHeader[0][prefixLen:], "=")
	decodedBasicAuth, err := base64.RawStdEncoding.DecodeString(based)
	if err != nil {
		return "", logger.LogErrorReturnFirst(log, err)
	}

	return strings.Split(string(decodedBasicAuth), ":")[1], nil
}

func (a *App) changePassword(w http.ResponseWriter, r *http.Request) {
	a.log.Info("changePassword invoked")

	oldPass, err := getPassFromHeader(r.Header, a.log)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error(), a.log)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	api := ipsecclient_yang.Ipsecclient_Api{}
	err = ipsecclient_yang.Unmarshal(body, &api)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	if err := api.Validate(); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)
		return
	}

	if err := a._changePassword(oldPass, *api.Password); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	respondWithJSON(w, http.StatusNoContent, nil, a.log)
}

func (a *App) getPkcs12(w http.ResponseWriter, r *http.Request) {
	a.log.Info("getPkcs12 invoked")

	endpointID, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	hwVrf := db.Vrf{ID: db.HardwareVrfID}
	if err := a.db.GetVrf(&hwVrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	decBytes, err := base64.RawStdEncoding.WithPadding('=').DecodeString(hwVrf.EndpointByID(uint32(endpointID)).Authentication.Pkcs12Base64)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	w.Header().Set("Content-Type", "application/octet-stream")
	w.WriteHeader(http.StatusOK)
	w.Write(decBytes)
}

func ClearCAs(log *logrus.Logger) error {
	log.Info("ClearCAs invoked")

	dir, err := ioutil.ReadDir(CAsDir)
	if err != nil {
		return logger.LogErrorReturnFirst(log, err)
	}

	for _, d := range dir {
		err := os.RemoveAll(path.Join([]string{CAsDir, d.Name()}...))
		if err != nil {
			return err
		}
	}

	return nil
}

func writeCAs(cas []db.CertificateAuthority, log *logrus.Logger) error {
	log.Info("writeCAs invoked")

	if err := ClearCAs(log); err != nil {
		return logger.LogErrorReturnFirst(log, err)
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
	a.log.Info("setCAs invoked")

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	api := ipsecclient_yang.Ipsecclient_Api{}
	err = ipsecclient_yang.Unmarshal(body, &api, nil)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	if err := api.Validate(); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)
		return
	}

	cas := []db.CertificateAuthority{}
	for _, caYang := range api.Ca {
		ca := db.CertificateAuthority{}
		ca.FromYang(caYang)
		cas = append(cas, ca)
	}

	if err := a.db.DeleteCAs(); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	if len(cas) > 0 {
		if err := a.db.Create(&cas); err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
			return
		}
	}

	if err := writeCAs(cas, a.log); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	a.log.Info("Set CAs completed")
	a.log.Debug(fmt.Sprintf("Set CAs completed|CAs: %v", cas))

	respondWithJSON(w, http.StatusNoContent, nil, a.log)
}

func (a *App) getCAs(w http.ResponseWriter, r *http.Request) {
	a.log.Info("getCAs invoked")
	cas, err := a.db.GetCAs()
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
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
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	a.log.Debugf("Get CAs: %v", cas)

	respondWithMarshalledJSON(w, http.StatusOK, json, a.log)
}

func (a *App) apiSetSetting(w http.ResponseWriter, r *http.Request) {
	a.log.Info("apiSetSetting invoked")

	name := mux.Vars(r)["name"]
	if name == "masterpass" {
		a.respondWithError(w, http.StatusBadRequest, "masterpass cannot be used as a setting name", a.log)
		return
	}

	key, err := getPassFromHeader(r.Header, a.log)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error(), a.log)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	j := map[string]interface{}{}
	if err := json.Unmarshal(body, &j); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)
		return
	}

	settingJson, err := json.Marshal(j["setting"])
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)
		return
	}

	setting := ipsecclient_yang.Ipsecclient_Api_Setting{}
	if err := ipsecclient_yang.Unmarshal(settingJson, &setting); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)
		return
	}

	if err := setting.Validate(); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)
		return
	}

	if err := a.db.SetSetting(key, name, *setting.Value); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	if name == "switch_address" {
		exec.Command("ip", "rule", "del", "pref", "2000").Output()
		exec.Command("ip", "rule", "add", "to", *setting.Value, "table", "1701", "pref", "2000").Output()
	}

	a.log.Info("Set setting completed")
	a.log.Debug(fmt.Sprintf("Set Setting completed|name: %s|value: %s", name, *setting.Value))

	respondWithJSON(w, http.StatusCreated, nil, a.log)
}

func (a *App) apiGetSetting(w http.ResponseWriter, r *http.Request) {
	a.log.Info("apiGetSetting invoked")

	name := mux.Vars(r)["name"]
	if name == "masterpass" {
		a.respondWithError(w, http.StatusBadRequest, "masterpass cannot be used as a setting name", a.log)
		return
	}

	key, err := getPassFromHeader(r.Header, a.log)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error(), a.log)
		return
	}

	value, err := a.db.GetSetting(key, name)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
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
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	a.log.Debugf("Get setting key %s value %s", name, value)

	respondWithMarshalledJSON(w, http.StatusOK, `{"setting":`+json+"}", a.log)
}

func (a *App) getVrfs(w http.ResponseWriter, r *http.Request) {
	a.log.Info("getVrfs invoked")

	vrfsMap := map[string]*ipsecclient_yang.Ipsecclient_Api_Vrf{}
	vrfs, err := a.db.GetVrfs()
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	key, err := getPassFromHeader(r.Header, a.log)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error(), a.log)
		return
	}

	for _, v := range vrfs {
		if err := a.db.DecryptPSK(key, &v); err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
			return
		}
		vrfYang, err := v.ToYang(a.log)
		if err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
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
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	a.log.Debugf("Get vrfs: %v", vrfs)

	respondWithMarshalledJSON(w, http.StatusOK, json, a.log)
}

func (a *App) getVrf(w http.ResponseWriter, r *http.Request) {
	a.log.Info("getVrf invoked")

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, "Invalid vrf ID", a.log)
		return
	}

	vrf := db.Vrf{ID: uint32(id)}
	if err := a.db.GetVrf(&vrf); err != nil {
		switch err {
		case gorm.ErrRecordNotFound:
			a.respondWithError(w, http.StatusNotFound, "Vrf not found", a.log)
		default:
			a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		}

		return
	}

	key, err := getPassFromHeader(r.Header, a.log)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error(), a.log)

		return
	}

	if err := a.db.DecryptPSK(key, &vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

		return
	}

	vrfYang, err := vrf.ToYang(a.log)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

		return
	}

	json, err := ygot.EmitJSON(vrfYang, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

		return
	}

	a.log.Debugf("Get vrf: %v", vrf)

	respondWithMarshalledJSON(w, http.StatusOK, `{"vrf":`+json+`}`, a.log)
}

func vrfUpdateValid(vrf db.Vrf, log *logrus.Logger) (bool, error) {
	log.Info("vrfUpdateValid invoked")

	if vrf.ID == db.HardwareVrfID {
		return true, nil
	}

	return vrfValid(vrf, log)
}

func vrfCreateValid(vrf db.Vrf, log *logrus.Logger) (bool, error) {
	log.Info("vrfCreateValid invoked")
	if vrf.ID == db.HardwareVrfID {
		return false, nil
	}

	return vrfValid(vrf, log)
}

func vrfValid(vrf db.Vrf, log *logrus.Logger) (bool, error) {
	log.Info("vrfValid invoked")

	if vrf.PhysicalInterface == "" {
		return false, nil
	}

	vlans, err := vrf.GetVlans(log)
	if err != nil {
		return false, logger.LogErrorReturnFirst(log, err)
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
	a.log.Info("_updateBackends invoked")
	// save and retrieve the vrf to update the endpoints ids
	if err := a.db.EncryptPSK(key, vrf); err != nil {
		return logger.LogErrorReturnFirst(a.log, err)
	}

	if err := a.db.UpdateVrf(vrf); err != nil {
		return logger.LogErrorReturnFirst(a.log, err)
	}
	if err := a.db.GetVrf(vrf); err != nil {
		return logger.LogErrorReturnFirst(a.log, err)
	}

	if err := a.db.DecryptPSK(key, vrf); err != nil {
		return logger.LogErrorReturnFirst(a.log, err)
	}

	// handle backends
	if *oldVrf.Active != *vrf.Active {
		if *vrf.Active {
			if err := a.generateConfigs(key, *vrf); err != nil {
				return logger.LogErrorReturnFirst(a.log, err)
			}
		} else {
			if err := a.deleteConfigs(key, *oldVrf); err != nil {
				return logger.LogErrorReturnFirst(a.log, err)
			}
		}
	} else if *vrf.Active {
		if err := a.deleteConfigs(key, *oldVrf); err != nil {
			return logger.LogErrorReturnFirst(a.log, err)
		}
		if err := a.generateConfigs(key, *vrf); err != nil {
			return logger.LogErrorReturnFirst(a.log, err)
		}
	}

	return nil
}

func vrfSubJsonValidSW(vrfSubJson interface{}, log *logrus.Logger) error {
	log.Info("vrfSubJsonValidSW invoked")

	vrf, ok := vrfSubJson.(map[string]interface{})
	if !ok {
		return logger.ReturnNewError("wrong vrfSubJson type", log)
	}

	isBGP, err := verifyEndpoints(vrf, log)
	if err != nil {
		return err
	}

	if isBGP {
		localAS, ok := vrf["local_as"].(float64)
		if !ok {
			return logger.ReturnNewError("no local_as or wrong type", log)
		}
		if localAS == 0 {
			return logger.ReturnNewError("local_as cannot be 0", log)
		}
	}

	vlans, ok := vrf["vlan"]
	if !ok {
		return logger.ReturnNewError("no vlans", log)
	}

	vlansList, ok := vlans.([]interface{})
	if !ok {
		return logger.ReturnNewError("wrong vlans type", log)
	}

	vlanIds := map[float64]int{}
	for _, v := range vlansList {
		vlan := v.(map[string]interface{})
		if !ok {
			return logger.ReturnNewError("wrong vlan type", log)
		}

		vlanId, ok := vlan["vlan"]
		if !ok {
			return logger.ReturnNewError("no vlan id", log)
		}

		vlanIdFloat, ok := vlanId.(float64)
		if !ok {
			return logger.ReturnNewError("wrong vlan id type", log)
		}

		vlanIds[vlanIdFloat]++
		if vlanIds[vlanIdFloat] > 1 {
			return logger.ReturnNewError(fmt.Sprintf("vlan %d appears more than once, %d times", int(vlanIdFloat), vlanIds[vlanIdFloat]), log)
		}
	}

	return nil
}

func vrfSubJsonValidHW(vrfSubJson interface{}, log *logrus.Logger) error {
	log.Info("vrfSubJsonValidHW invoked")
	vrf, ok := vrfSubJson.(map[string]interface{})
	if !ok {
		return logger.ReturnNewError("wrong vrfSubJson type", log)
	}

	_, err := verifyEndpoints(vrf, log)

	return err
}

func verifyEndpoints(vrf map[string]interface{}, log *logrus.Logger) (bool, error) {
	log.Info("verifyEndpoints invoked")

	endpointInt, ok := vrf["endpoint"]
	if !ok {
		return false, nil
	}

	endpoints, ok := endpointInt.([]interface{})
	if !ok {
		return false, logger.ReturnNewError("wrong endpoints json type", log)
	}

	isBGP := false
	for _, e := range endpoints {
		if e, ok := e.(map[string]interface{}); ok {
			local_ip, ok := e["local_ip"].(string)
			if ok && strings.Contains(local_ip, ":") {
				return false, logger.ReturnNewError("endpoint local ip: IPv6 not supported", log)
			}

			peer_ip, ok := e["peer_ip"].(string)
			if ok && strings.Contains(peer_ip, ":") {
				return false, logger.ReturnNewError("endpoint peer ip: IPv6 not supported", log)
			}

			bgp, ok := e["bgp"].(bool)
			if ok {
				isBGP = isBGP || bgp
			}

		} else {
			return false, logger.ReturnNewError("wrong endpoint json type", log)
		}
	}

	return isBGP, nil
}

func (a *App) createVrf(w http.ResponseWriter, r *http.Request) {
	a.log.Info("createVrf invoked")

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	j := map[string]interface{}{}
	if err := json.Unmarshal(body, &j); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)
		return
	}

	vrfSubJson, ok := j["vrf"]
	if !ok {
		a.respondWithError(w, http.StatusBadRequest, "malformed json", a.log)
		return
	}

	if err := vrfSubJsonValidSW(vrfSubJson, a.log); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)
		return
	}

	vrfJson, err := json.Marshal(vrfSubJson)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)
		return
	}

	yangVrf := ipsecclient_yang.Ipsecclient_Api_Vrf{}
	if err := ipsecclient_yang.Unmarshal(vrfJson, &yangVrf); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)
		return
	}

	if err := yangVrf.Validate(); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)
		return
	}

	vrf := db.Vrf{}
	vrf.FromYang(&yangVrf, a.log)
	valid, err := vrfCreateValid(vrf, a.log)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	if !valid {
		a.respondWithError(w, http.StatusBadRequest, "vrf invalid", a.log)
		return
	}

	if vrf.Active == nil {
		vrf.Active = new(bool)
	}

	key, err := getPassFromHeader(r.Header, a.log)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error(), a.log)
		return
	}

	if err := a.db.EncryptPSK(key, &vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	if err := a.db.Create(&vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	if err := a.db.DecryptPSK(key, &vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	if err := a._updateBackends(key, &vrf, &db.Vrf{
		ID:     vrf.ID,
		Active: db.BoolPointer(nil),
	}); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	a.log.Info("Create vrf completed")
	a.log.Debug(fmt.Sprintf("Create vrf completed|vrf: %v", vrf))

	if len(r.Header["Origin"]) < 1 {
		w.Header().Set("Location", fmt.Sprintf("%s=%d", vrfPath, vrf.ID))
	} else {
		w.Header().Set("Location", fmt.Sprintf("%s%s=%d", r.Header["Origin"][0], vrfPath, vrf.ID))
	}

	respondWithJSON(w, http.StatusCreated, nil, a.log)
}

func (a *App) updateVrf(w http.ResponseWriter, r *http.Request) {
	a.log.Info("updateVrf invoked")

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, "Invalid vrf ID", a.log)

		return
	}

	body, err := ioutil.ReadAll(r.Body)
	a.log.Debugf("update vrf request %s\n", body)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

		return
	}

	j := map[string]interface{}{}
	if err := json.Unmarshal(body, &j); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)

		return
	}

	vrfSubJson, ok := j["vrf"]
	if !ok {
		a.respondWithError(w, http.StatusBadRequest, "malformed json", a.log)

		return
	}

	if id != db.HardwareVrfID {
		if err := vrfSubJsonValidSW(vrfSubJson, a.log); err != nil {
			a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)

			return
		}
	} else {
		if err := vrfSubJsonValidHW(vrfSubJson, a.log); err != nil {
			a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)

			return
		}
	}

	vrfJson, err := json.Marshal(vrfSubJson)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)

		return
	}

	yangVrf := ipsecclient_yang.Ipsecclient_Api_Vrf{}
	if err := ipsecclient_yang.Unmarshal(vrfJson, &yangVrf); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)

		return
	}

	if err := yangVrf.Validate(); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error(), a.log)

		return
	}

	key, err := getPassFromHeader(r.Header, a.log)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error(), a.log)

		return
	}

	vrf := db.Vrf{}
	vrf.ID = uint32(id)
	vrf.FromYang(&yangVrf, a.log)

	valid, err := vrfUpdateValid(vrf, a.log)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

		return
	}

	if !valid {
		a.respondWithError(w, http.StatusBadRequest, "vrf invalid", a.log)

		return
	}

	var oldVrf db.Vrf
	oldVrf.ID = uint32(id)

	if err := a.db.GetVrf(&oldVrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

		return
	}

	if vrf.ID == db.HardwareVrfID && vrf.ClientName != oldVrf.ClientName {
		// can't change the hardware vrf name
		a.respondWithError(w, http.StatusBadRequest, "Cannot change the hardware vrf name", a.log)

		return
	}

	if vrf.Active == nil {
		vrf.Active = oldVrf.Active
	}

	if err := a._updateBackends(key, &vrf, &oldVrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

		return
	}

	a.log.Info("Update vrf completed")
	a.log.Debug(fmt.Sprintf("Update vrf completed|old vrf: %v|updated vrf: %v", oldVrf, vrf))

	respondWithJSON(w, http.StatusNoContent, nil, a.log)
}

func (a *App) getSwitchCreds(key string) (*db.SwitchCreds, error) {
	a.log.Info("getSwitchCreds invoked")

	var err error
	username, err := a.db.GetSetting(key, "switch_username")
	if err != nil {
		return nil, logger.LogErrorReturnFirst(a.log, err)
	}

	password, err := a.db.GetSetting(key, "switch_password")
	if err != nil {
		return nil, logger.LogErrorReturnFirst(a.log, err)
	}

	switchAddress, err := a.db.GetSetting(key, "switch_address")
	if err != nil {
		return nil, logger.LogErrorReturnFirst(a.log, err)
	}

	whenEspHmac, err := a.db.GetSetting(key, "when_esp_hmac")
	if err != nil {
		whenEspHmac = ""
	}

	return &db.SwitchCreds{Username: username, Password: password, SwitchAddress: switchAddress, WhenEspHmac: whenEspHmac}, nil
}

func (a *App) generateConfigs(key string, vrf db.Vrf) error {
	a.log.Info("generateConfigs invoked")

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
	a.log.Info("deleteConfigs invoked")

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
	a.log.Info("deleteVrf invoked")

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, "Invalid Vrf ID", a.log)

		return
	}

	key, err := getPassFromHeader(r.Header, a.log)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error(), a.log)

		return
	}

	vrf := db.Vrf{ID: uint32(id)}
	if err := a.db.GetVrf(&vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

		return
	}

	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

		return
	}

	err = a.deleteConfigs(key, vrf)
	if err != nil {
		logger.LogErrorReturnFirst(a.log, err)
		a.db.DeleteVrf(&vrf)
		err = nil
		if id == db.HardwareVrfID {
			err = a.ensureHWVRF()
		}
	}

	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
	}

	a.log.Info("Delete vrf completed")
	a.log.Debug(fmt.Sprintf("Delete vrf completed|deleted vrf: %v", vrf))

	respondWithJSON(w, http.StatusNoContent, nil, a.log)
}

func min(a, b int64) int64 {
	if a < b {
		return a
	}

	return b
}

func getLastBytesOfFile(fname string, maxBytes int64, log *logrus.Logger) ([]byte, error) {
	log.Info("getLastBytesOfFile invoked")

	file, err := os.Open(fname)
	if err != nil {
		return nil, logger.LogErrorReturnFirst(log, err)
	}

	defer file.Close()

	stat, err := os.Stat(fname)
	if err != nil {
		return nil, logger.LogErrorReturnFirst(log, err)
	}

	bytes := min(maxBytes, stat.Size())
	buf := make([]byte, bytes)
	start := stat.Size() - bytes
	_, err = file.ReadAt(buf, start)
	if err != nil {
		return nil, logger.LogErrorReturnFirst(log, err)
	}

	return buf, nil
}

func (a *App) getLogs(w http.ResponseWriter, r *http.Request) {
	a.log.Info("getLogs invoked")

	processInfos, err := config.GetProcessInfos(a.log)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

		return
	}

	api := ipsecclient_yang.Ipsecclient_Api{
		Log: map[string]*ipsecclient_yang.Ipsecclient_Api_Log{},
	}

	for _, info := range processInfos {
		log, err := getLastBytesOfFile(info.StdoutLogfile, lastLogBytes, a.log)
		if err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

			return
		}

		api.Log[info.Name] = &ipsecclient_yang.Ipsecclient_Api_Log{
			Name: db.StringPointer(info.Name),
			Log:  db.StringPointer(string(log)),
		}
	}

	json, err := ygot.EmitJSON(&api, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

		return
	}

	respondWithMarshalledJSON(w, http.StatusOK, json, a.log)
}

func (a *App) getErrors(w http.ResponseWriter, r *http.Request) {
	a.log.Info("getErrors invoked")

	storedErrors, err := a.db.GetStoredErrors()
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

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
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

		return
	}

	respondWithMarshalledJSON(w, http.StatusOK, json, a.log)
}

func (a *App) getSourceInterfaces(w http.ResponseWriter, r *http.Request) {
	a.log.Info("getSourceInterfaces invoked")

	key, err := getPassFromHeader(r.Header, a.log)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error(), a.log)

		return
	}

	switchCreds, err := a.getSwitchCreds(key)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

		return
	}

	sourceInterfaces, err := config.GetSourceInterfaces(*switchCreds, a.log)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

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
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	respondWithMarshalledJSON(w, http.StatusOK, json, a.log)
}

func (a *App) _getAlgorithms(key string) (db.Algorithm, error) {
	a.log.Info("_getAlgorithms invoked")

	algorithms := db.Algorithm{}
	whenEspHmac := ""
	if err := a.db.GetAlgorithms(&algorithms); err != nil {
		switchCreds, err := a.getSwitchCreds(key)
		if err != nil {
			return algorithms, err
		}

		algorithms, whenEspHmac, err = config.GetAlgorithms(*switchCreds, a.log)
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
	a.log.Info("getAlgorithms invoked")

	key, err := getPassFromHeader(r.Header, a.log)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error(), a.log)
		return
	}

	algorithms, err := a._getAlgorithms(key)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
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
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

		return
	}

	respondWithMarshalledJSON(w, http.StatusOK, json, a.log)
}

func (a *App) checkSwitchBasicAuth(w http.ResponseWriter, r *http.Request) {
	a.log.Info("checkSwitchBasicAuth invoked")

	key, err := getPassFromHeader(r.Header, a.log)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error(), a.log)
		return
	}

	switchCreds, err := a.getSwitchCreds(key)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

		return
	}

	isValid, err := a.hardwareGenerator.CheckSwitchBasicAuth(*switchCreds)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)

		return
	}

	if isValid {
		model, err := a.hardwareGenerator.GetSwitchModel(*switchCreds)
		if err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
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
		a.respondWithError(w, http.StatusInternalServerError, err.Error(), a.log)
		return
	}

	respondWithMarshalledJSON(w, http.StatusOK, json, a.log)
}

func respondWithMarshalledJSON(w http.ResponseWriter, code int, response string, log *logrus.Logger) {
	log.Info("respondWithMarshalledJSON invoked")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if _, err := w.Write([]byte(response)); err != nil {
		logger.ReturnNewError("Error while writing the response: "+err.Error(), log)
	}
}

func (a *App) respondWithError(w http.ResponseWriter, code int, message string, log *logrus.Logger) {
	a.log.Info("respondWithError invoked")

	a.storeError(message)
	logger.ReturnErrorEx(2, log, fmt.Errorf(message))
	respondWithJSON(w, code, map[string]string{"result": "error", "error": message}, log)
}

func (a *App) storeError(message string) {
	newError := db.StoredError{Message: message, ErrorTime: time.Now()}

	a.db.RotateErrorsBySizeOrDate()
	a.db.Create(&newError)
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}, log *logrus.Logger) {
	log.Info("respondWithJSON invoked")

	response, _ := json.Marshal(payload)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if payload != nil {
		if _, err := w.Write(response); err != nil {
			logger.ReturnNewError("Error while writing the response: "+err.Error(), log)
		}
	}
}
