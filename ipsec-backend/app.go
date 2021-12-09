package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"ipsec_backend/config"
	"ipsec_backend/db"
	"ipsec_backend/logger"
	"ipsec_backend/sico_yang"
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
	restconfBasePath = "/restconf/data/sico-ipsec:api"
	vrfPath          = restconfBasePath + "/vrf"
	vrfIDPath        = vrfPath + "={id:[0-9]+}"
	monitoringPath   = restconfBasePath + "/monitoring={id:[0-9]+}"
	logPath          = restconfBasePath + "/log"
	errorPath        = restconfBasePath + "/error"
	CAPath           = restconfBasePath + "/ca"
	settingNamePath  = restconfBasePath + "/setting={name:[a-zA-Z0-9-_]+}"
	passPath         = restconfBasePath + "/password"

	pkcs12Path = "/pkcs12/{id:[0-9]+}"

	nginxPasswordFile = "/etc/nginx/htpasswd"
	username          = "admin"
	CAsDir            = "/opt/ipsec/x509ca"

	lastLogBytes = 65536
)

type App struct {
	router            *mux.Router
	db                db.DBinterface
	softwareGenerator config.Generator
	hardwareGenerator config.Generator
}

func (a *App) ensureHWVRF() error {
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
	return logger.ReturnError(err)
}

func NewApp(dbInstance db.DBinterface, softwareGenerator, hardwareGenerator config.Generator, switchCreds db.SwitchCreds) (*App, error) {
	app := new(App)

	app.db = dbInstance
	app.softwareGenerator = softwareGenerator
	app.hardwareGenerator = hardwareGenerator
	app.initializeRoutes()

	if err := app.initializeSettings(switchCreds); err != nil {
		return nil, logger.ReturnError(err)
	}

	if err := app.ensureHWVRF(); err != nil {
		return nil, logger.ReturnError(err)
	}

	return app, logger.ReturnError(ioutil.WriteFile("/opt/frr/vtysh.conf", []byte(""), 0644))
}

func (a *App) initializeSettings(switchCreds db.SwitchCreds) error {
	password := "cisco123"
	if err := htpasswd.SetPassword(nginxPasswordFile, username, password, htpasswd.HashBCrypt); err != nil {
		return logger.ReturnError(err)
	}
	return logger.ReturnError(
		a.db.SetSetting(password, "switch_username", switchCreds.Username),
		a.db.SetSetting(password, "switch_password", switchCreds.Password),
		a.db.SetSetting(password, "system_name", os.Getenv("CAF_SYSTEM_NAME")),
		a.db.SetSetting(password, "app_version", os.Getenv("APP_VERSION")),
	)
}

func (a *App) _changePassword(oldPass, newPass string) error {
	log.Infof("changing pass from %s to %s", oldPass, newPass)
	if err := htpasswd.SetPassword(nginxPasswordFile, username, newPass, htpasswd.HashBCrypt); err != nil {
		return logger.ReturnError(err)
	}
	cmd := exec.Command("nginx", "-s", "reload")
	if _, err := cmd.Output(); err != nil {
		return logger.ReturnError(err)
	}
	return logger.ReturnError(a.db.ChangePassword(oldPass, newPass))
}

func (a *App) Run(addr string) {
	logger.Fatal(http.ListenAndServe(addr, a.router))
}

func (a *App) initializeRoutes() {
	a.router = mux.NewRouter()
	a.router.HandleFunc(vrfPath, a.getVrfs).Methods(http.MethodGet)
	a.router.HandleFunc(vrfPath, a.createVrf).Methods(http.MethodPost)
	a.router.HandleFunc(vrfIDPath, a.getVrf).Methods(http.MethodGet)
	a.router.HandleFunc(vrfIDPath, a.updateVrf).Methods(http.MethodPatch)
	a.router.HandleFunc(vrfIDPath, a.deleteVrf).Methods(http.MethodDelete)
	a.router.HandleFunc(monitoringPath, a.monitoring).Methods(http.MethodGet)
	a.router.HandleFunc(logPath, a.getLogs).Methods(http.MethodGet)
	a.router.HandleFunc(errorPath, a.getErrors).Methods(http.MethodGet)
	a.router.HandleFunc(settingNamePath, a.apiGetSetting).Methods(http.MethodGet)
	a.router.HandleFunc(settingNamePath, a.apiSetSetting).Methods(http.MethodPost)
	a.router.HandleFunc(passPath, a.changePassword).Methods(http.MethodPost)
	a.router.HandleFunc(CAPath, a.setCAs).Methods(http.MethodPost)
	a.router.HandleFunc(CAPath, a.getCAs).Methods(http.MethodGet)
	a.router.HandleFunc(pkcs12Path, a.getPkcs12).Methods(http.MethodGet)
}

func getPassFromHeader(header http.Header) (string, error) {
	authHeader := header["Authorization"]
	if len(authHeader) == 0 {
		return "", logger.ReturnNewError("no basic auth")
	}
	prefixLen := len("Basic ")
	based := strings.TrimRight(authHeader[0][prefixLen:], "=")
	decodedBasicAuth, err := base64.RawStdEncoding.DecodeString(based)
	if err != nil {
		return "", logger.ReturnError(err)
	}
	return strings.Split(string(decodedBasicAuth), ":")[1], nil
}

func (a *App) changePassword(w http.ResponseWriter, r *http.Request) {
	oldPass, err := getPassFromHeader(r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	api := sico_yang.SicoIpsec_Api{}
	err = sico_yang.Unmarshal(body, &api)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := api.Validate(); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := a._changePassword(oldPass, *api.Password); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusNoContent, nil)
}

func (a *App) getPkcs12(w http.ResponseWriter, r *http.Request) {
	endpointID, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	hwVrf := db.Vrf{ID: db.HardwareVrfID}
	if err := a.db.GetVrf(&hwVrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	decBytes, err := base64.RawStdEncoding.WithPadding('=').DecodeString(hwVrf.EndpointByID(uint32(endpointID)).Authentication.Pkcs12Base64)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/octet-stream")
	w.WriteHeader(http.StatusOK)
	w.Write(decBytes)
}

func ClearCAs() error {
	dir, err := ioutil.ReadDir(CAsDir)
	if err != nil {
		return logger.ReturnError(err)
	}
	errs := []error{}
	for _, d := range dir {
		errs = append(errs, os.RemoveAll(path.Join([]string{CAsDir, d.Name()}...)))
	}
	return logger.ReturnError(errs...)
}

func writeCAs(cas []db.CertificateAuthority) error {
	if err := ClearCAs(); err != nil {
		return logger.ReturnError(err)
	}
	errs := []error{}
	for _, ca := range cas {
		errs = append(errs, ioutil.WriteFile(fmt.Sprintf("%s/%d.pem", CAsDir, ca.ID), []byte(ca.CA), 0644))
	}
	return logger.ReturnError(errs...)
}

func (a *App) setCAs(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	api := sico_yang.SicoIpsec_Api{}
	err = sico_yang.Unmarshal(body, &api, nil)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := api.Validate(); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	cas := []db.CertificateAuthority{}
	for _, caYang := range api.Ca {
		ca := db.CertificateAuthority{}
		ca.FromYang(caYang)
		cas = append(cas, ca)
	}
	if err := a.db.DeleteCAs(); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if len(cas) > 0 {
		if err := a.db.Create(&cas); err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
	}
	if err := writeCAs(cas); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	logger.InfoDebug("Set CAs completed", fmt.Sprintf("Set CAs completed|CAs: %v", cas))
	respondWithJSON(w, http.StatusNoContent, nil)
}

func (a *App) getCAs(w http.ResponseWriter, r *http.Request) {
	cas, err := a.db.GetCAs()
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	api := sico_yang.SicoIpsec_Api{
		Ca: map[uint32]*sico_yang.SicoIpsec_Api_Ca{},
	}
	for _, ca := range cas {
		api.Ca[ca.ID] = ca.ToYang()
	}
	json, err := ygot.EmitJSON(&api, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	log.Debugf("Get CAs: %v", cas)

	respondWithMarshalledJSON(w, http.StatusOK, json)
}

func (a *App) apiSetSetting(w http.ResponseWriter, r *http.Request) {
	name := mux.Vars(r)["name"]
	if name == "masterpass" {
		a.respondWithError(w, http.StatusBadRequest, "masterpass cannot be used as a setting name")
		return
	}

	key, err := getPassFromHeader(r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	j := map[string]interface{}{}
	if err := json.Unmarshal(body, &j); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	settingJson, err := json.Marshal(j["setting"])
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	setting := sico_yang.SicoIpsec_Api_Setting{}
	if err := sico_yang.Unmarshal(settingJson, &setting); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := setting.Validate(); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := a.db.SetSetting(key, name, *setting.Value); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	logger.InfoDebug("Set setting completed", fmt.Sprintf("Set Setting completed|key: %s|value: %s", key, *setting.Value))

	respondWithJSON(w, http.StatusCreated, nil)
}

func (a *App) apiGetSetting(w http.ResponseWriter, r *http.Request) {
	name := mux.Vars(r)["name"]
	if name == "masterpass" {
		a.respondWithError(w, http.StatusBadRequest, "masterpass cannot be used as a setting name")
		return
	}

	key, err := getPassFromHeader(r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}
	value, err := a.db.GetSetting(key, name)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	setting := sico_yang.SicoIpsec_Api_Setting{
		Name:  db.StringPointer(name),
		Value: db.StringPointer(value),
	}
	json, err := ygot.EmitJSON(&setting, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	log.Debugf("Get setting key %s value %s", key, value)

	respondWithMarshalledJSON(w, http.StatusOK, `{"setting":`+json+"}")
}

func (a *App) getVrfs(w http.ResponseWriter, r *http.Request) {
	vrfsMap := map[string]*sico_yang.SicoIpsec_Api_Vrf{}
	vrfs, err := a.db.GetVrfs()
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	key, err := getPassFromHeader(r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}
	for _, v := range vrfs {
		if err := a.db.DecryptPSK(key, &v); err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		vrfYang, err := v.ToYang()
		if err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		vrfsMap[v.ClientName] = vrfYang
	}
	api := sico_yang.SicoIpsec_Api{
		Vrf: vrfsMap,
	}
	json, err := ygot.EmitJSON(&api, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	log.Debugf("Get vrfs: %v", vrfs)
	respondWithMarshalledJSON(w, http.StatusOK, json)
}

func (a *App) getVrf(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, "Invalid vrf ID")
		return
	}
	vrf := db.Vrf{ID: uint32(id)}
	if err := a.db.GetVrf(&vrf); err != nil {
		switch err {
		case gorm.ErrRecordNotFound:
			a.respondWithError(w, http.StatusNotFound, "Vrf not found")
		default:
			a.respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}
	key, err := getPassFromHeader(r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}
	if err := a.db.DecryptPSK(key, &vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	vrfYang, err := vrf.ToYang()
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	json, err := ygot.EmitJSON(vrfYang, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	log.Debugf("Get vrf: %v", vrf)

	respondWithMarshalledJSON(w, http.StatusOK, `{"vrf":`+json+`}`)
}

func vrfUpdateValid(vrf db.Vrf) (bool, error) {
	if vrf.ID == db.HardwareVrfID {
		return true, nil
	}
	return vrfValid(vrf)
}

func vrfCreateValid(vrf db.Vrf) (bool, error) {
	if vrf.ID == db.HardwareVrfID {
		return false, nil
	}
	return vrfValid(vrf)
}

func vrfValid(vrf db.Vrf) (bool, error) {
	if vrf.PhysicalInterface == "" {
		return false, nil
	}
	vlans, err := vrf.GetVlans()
	if err != nil {
		return false, logger.ReturnError(err)
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
	// save and retrieve the vrf to update the endpoints ids
	if err := a.db.EncryptPSK(key, vrf); err != nil {
		return logger.ReturnError(err)
	}
	if err := a.db.UpdateVrf(vrf); err != nil {
		return logger.ReturnError(err)
	}
	if err := a.db.GetVrf(vrf); err != nil {
		return logger.ReturnError(err)
	}
	if err := a.db.DecryptPSK(key, vrf); err != nil {
		return logger.ReturnError(err)
	}

	// handle backends
	if *oldVrf.Active != *vrf.Active {
		if *vrf.Active {
			if err := a.generateConfigs(key, *vrf); err != nil {
				return logger.ReturnError(err)
			}
		} else {
			if err := a.deleteConfigs(key, *oldVrf); err != nil {
				return logger.ReturnError(err)
			}
		}
	} else if *vrf.Active {
		if err := a.deleteConfigs(key, *oldVrf); err != nil {
			return logger.ReturnError(err)
		}
		if err := a.generateConfigs(key, *vrf); err != nil {
			return logger.ReturnError(err)
		}
	}
	return nil
}

func vrfSubJsonValid(vrfSubJson interface{}) error {
	vrf, ok := vrfSubJson.(map[string]interface{})
	if !ok {
		return logger.ReturnNewError("wrong vrfSubJson type")
	}
	vlans, ok := vrf["vlan"]
	if !ok {
		return logger.ReturnNewError("no vlans")
	}
	vlansList, ok := vlans.([]interface{})
	if !ok {
		return logger.ReturnNewError("wrong vlans type")
	}
	vlanIds := map[float64]int{}
	for _, v := range vlansList {
		vlan := v.(map[string]interface{})
		if !ok {
			return logger.ReturnNewError("wrong vlan type")
		}
		vlanId, ok := vlan["vlan"]
		if !ok {
			return logger.ReturnNewError("no vlan id")
		}
		vlanIdFloat, ok := vlanId.(float64)
		if !ok {
			return logger.ReturnNewError("wrong vlan id type")
		}
		vlanIds[vlanIdFloat]++
		if vlanIds[vlanIdFloat] > 1 {
			return logger.ReturnNewError(fmt.Sprintf("vlan %d appears more than once, %d times", int(vlanIdFloat), vlanIds[vlanIdFloat]))
		}
	}
	return nil
}

func (a *App) createVrf(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	j := map[string]interface{}{}
	if err := json.Unmarshal(body, &j); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	vrfSubJson, ok := j["vrf"]
	if !ok {
		a.respondWithError(w, http.StatusBadRequest, "malformed json")
		return
	}
	if err := vrfSubJsonValid(vrfSubJson); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	vrfJson, err := json.Marshal(vrfSubJson)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	yangVrf := sico_yang.SicoIpsec_Api_Vrf{}
	if err := sico_yang.Unmarshal(vrfJson, &yangVrf); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := yangVrf.Validate(); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	vrf := db.Vrf{}
	vrf.FromYang(&yangVrf)
	valid, err := vrfCreateValid(vrf)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if !valid {
		a.respondWithError(w, http.StatusBadRequest, "vrf invalid")
		return
	}
	if vrf.Active == nil {
		vrf.Active = new(bool)
	}
	key, err := getPassFromHeader(r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}
	if err := a.db.EncryptPSK(key, &vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := a.db.Create(&vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := a.db.DecryptPSK(key, &vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if err := a._updateBackends(key, &vrf, &db.Vrf{
		ID:     vrf.ID,
		Active: db.BoolPointer(nil),
	}); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	logger.InfoDebug("Create vrf completed", fmt.Sprintf("Create vrf completed|vrf: %v", vrf))

	if len(r.Header["Origin"]) < 1 {
		w.Header().Set("Location", fmt.Sprintf("%s=%d", vrfPath, vrf.ID))
	} else {
		w.Header().Set("Location", fmt.Sprintf("%s%s=%d", r.Header["Origin"][0], vrfPath, vrf.ID))
	}

	respondWithJSON(w, http.StatusCreated, nil)
}

type handler func(db.Vrf) error

func (a *App) updateVrf(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, "Invalid vrf ID")
		return
	}
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	j := map[string]interface{}{}
	if err := json.Unmarshal(body, &j); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	vrfSubJson, ok := j["vrf"]
	if !ok {
		a.respondWithError(w, http.StatusBadRequest, "malformed json")
		return
	}
	if err := vrfSubJsonValid(vrfSubJson); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	vrfJson, err := json.Marshal(vrfSubJson)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	yangVrf := sico_yang.SicoIpsec_Api_Vrf{}
	if err := sico_yang.Unmarshal(vrfJson, &yangVrf); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := yangVrf.Validate(); err != nil {
		a.respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	key, err := getPassFromHeader(r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}
	vrf := db.Vrf{}
	vrf.ID = uint32(id)
	vrf.FromYang(&yangVrf)

	valid, err := vrfUpdateValid(vrf)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if !valid {
		a.respondWithError(w, http.StatusBadRequest, "vrf invalid")
		return
	}
	var oldVrf db.Vrf
	oldVrf.ID = uint32(id)

	if err := a.db.GetVrf(&oldVrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if vrf.ID == db.HardwareVrfID && vrf.ClientName != oldVrf.ClientName {
		// can't change the hardware vrf name
		a.respondWithError(w, http.StatusBadRequest, "Cannot change the hardware vrf name")
		return
	}

	if vrf.Active == nil {
		vrf.Active = oldVrf.Active
	}

	if err := a._updateBackends(key, &vrf, &oldVrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	logger.InfoDebug("Update vrf completed", fmt.Sprintf("Update vrf completed|old vrf: %v|updated vrf: %v", oldVrf, vrf))

	respondWithJSON(w, http.StatusNoContent, nil)
}

func (a *App) getSwitchCreds(key string) (*db.SwitchCreds, error) {
	var err error
	username, err := a.db.GetSetting(key, "switch_username")
	if err != nil {
		return nil, logger.ReturnError(err)
	}
	password, err := a.db.GetSetting(key, "switch_password")
	if err != nil {
		return nil, logger.ReturnError(err)
	}
	return &db.SwitchCreds{username, password}, nil
}

func (a *App) generateConfigs(key string, vrf db.Vrf) error {
	if vrf.ID == db.HardwareVrfID {
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
	if vrf.ID == db.HardwareVrfID {
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
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, "Invalid Vrf ID")
		return
	}

	key, err := getPassFromHeader(r.Header)
	if err != nil {
		a.respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}

	vrf := db.Vrf{ID: uint32(id)}
	if err := a.db.GetVrf(&vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	err = logger.ReturnError(
		func() error {
			return a.deleteConfigs(key, vrf)
		}(),
		a.db.DeleteVrf(&vrf),
		func() error {
			if id == db.HardwareVrfID {
				return a.ensureHWVRF()
			}
			return nil
		}(),
	)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
	}
	logger.InfoDebug("Delete vrf completed", fmt.Sprintf("Delete vrf completed|deleted vrf: %v", vrf))
	respondWithJSON(w, http.StatusNoContent, nil)
}

func min(a, b int64) int64 {
	if a < b {
		return a
	}
	return b
}

func getLastBytesOfFile(fname string, maxBytes int64) ([]byte, error) {
	file, err := os.Open(fname)
	if err != nil {
		return nil, logger.ReturnError(err)
	}
	defer file.Close()

	stat, err := os.Stat(fname)
	if err != nil {
		return nil, logger.ReturnError(err)
	}
	bytes := min(maxBytes, stat.Size())
	buf := make([]byte, bytes)
	start := stat.Size() - bytes
	_, err = file.ReadAt(buf, start)
	if err != nil {
		return nil, logger.ReturnError(err)
	}
	return buf, nil
}

func (a *App) getLogs(w http.ResponseWriter, r *http.Request) {
	processInfos, err := config.GetProcessInfos()
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	api := sico_yang.SicoIpsec_Api{
		Log: map[string]*sico_yang.SicoIpsec_Api_Log{},
	}
	for _, info := range processInfos {
		log, err := getLastBytesOfFile(info.StdoutLogfile, lastLogBytes)
		if err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		api.Log[info.Name] = &sico_yang.SicoIpsec_Api_Log{
			Name: db.StringPointer(info.Name),
			Log:  db.StringPointer(string(log)),
		}
	}

	json, err := ygot.EmitJSON(&api, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithMarshalledJSON(w, http.StatusOK, json)
}

func (a *App) getErrors(w http.ResponseWriter, r *http.Request) {
	storedErrors, err := a.db.GetStoredErrors()
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	yangErrors := []*sico_yang.SicoIpsec_Api_Error{}
	for _, storedError := range storedErrors {
		yangErrors = append(yangErrors, storedError.ToYang())
	}

	api := sico_yang.SicoIpsec_Api{
		Error: yangErrors,
	}

	json, err := ygot.EmitJSON(&api, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithMarshalledJSON(w, http.StatusOK, json)
}

func respondWithMarshalledJSON(w http.ResponseWriter, code int, response string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if _, err := w.Write([]byte(response)); err != nil {
		logger.ReturnNewError("Error while writing the response: " + err.Error())
	}
}

func (a *App) respondWithError(w http.ResponseWriter, code int, message string) {
	a.storeError(message)
	logger.ReturnErrorEx(2, fmt.Errorf(message))
	respondWithJSON(w, code, map[string]string{"result": "error", "error": message})
}

func (a *App) storeError(message string) {
	newError := db.StoredError{Message: message, ErrorTime: time.Now()}

	a.db.RotateErrorsBySizeOrDate()
	a.db.Create(&newError)
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if payload != nil {
		if _, err := w.Write(response); err != nil {
			logger.ReturnNewError("Error while writing the response: " + err.Error())
		}
	}
}
