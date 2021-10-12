package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"ipsec_backend/sico_yang"
	"net/http"
	"os"
	"os/exec"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/foomo/htpasswd"
	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
	"github.com/openconfig/ygot/ygot"
	"gorm.io/gorm"
)

const (
	restconfBasePath = "/restconf/data/sico-ipsec:api"
	vrfPath          = restconfBasePath + "/vrf"
	vrfIDPath        = vrfPath + "={id:[0-9]+}"
	monitoringPath   = restconfBasePath + "/monitoring={id:[0-9]+}"
	logPath          = restconfBasePath + "/log"
	CAPath           = restconfBasePath + "/ca"
	settingNamePath  = restconfBasePath + "/setting={name:[a-zA-Z0-9-_]+}"
	passPath         = restconfBasePath + "/password"

	nginxPasswordFile = "/etc/nginx/htpasswd"
	username          = "admin"
	CAsDir            = "/opt/ipsec/x509ca"

	lastLogBytes = 65536
)

type Generator interface {
	GenerateTemplates(v Vrf) error
	DeleteTemplates(v Vrf) error
}

type App struct {
	Router         *mux.Router
	DB             *gorm.DB
	Generator      Generator
	switchUsername string
	switchPassword string
}

func (a *App) ensureHWVRF() error {
	hwVrf := Vrf{
		ID:         hardwareVrfID,
		ClientName: "hardware",
		CryptoPh1:  []byte("[\"aes-cbc-128\", \"sha256\", \"fourteen\"]"),
		CryptoPh2:  []byte("[\"esp-aes\", \"esp-sha-hmac\", \"group14\"]"),
		Active:     boolPointer(false),
		Endpoints:  []Endpoint{},
		Vlans:      []byte("[]"),
	}
	err := hwVrf.createVrf(a.DB)
	if err == nil {
		return nil
	}
	if strings.Contains(err.Error(),
		"UNIQUE constraint failed: vrfs.id") {
		return nil
	}
	return ReturnError(err)
}

func (a *App) Initialize(dbName string) error {
	var err error
	a.DB, err = initializeDB(dbName)
	if err != nil {
		Fatal(err)
	}

	a.Generator = FileGenerator{}

	a.initializeRoutes()

	err = a.setDefaultPasswords()
	if err != nil {
		Fatal(err)
	}

	if err := a.ensureHWVRF(); err != nil {
		return ReturnError(err)
	}

	return ReturnError(ioutil.WriteFile("/opt/frr/vtysh.conf", []byte(""), 0644))
}

func (a *App) setDefaultPasswords() error {
	password := "cisco123"
	if err := htpasswd.SetPassword(nginxPasswordFile, username, password, htpasswd.HashBCrypt); err != nil {
		return ReturnError(err)
	}
	return ReturnError(
		a.ensureMasterPass(password, randString(32)),
		a.setSetting(password, "switch_username", "admin"),
		a.setSetting(password, "switch_password", "cisco123"),
	)
}

func (a *App) _changePassword(oldPass, newPass string) error {
	fmt.Println("changing pass from", oldPass, "to", newPass)
	if err := htpasswd.SetPassword(nginxPasswordFile, username, newPass, htpasswd.HashBCrypt); err != nil {
		return ReturnError(err)
	}
	cmd := exec.Command("nginx", "-s", "reload")
	if _, err := cmd.Output(); err != nil {
		return ReturnError(err)
	}
	masterpass, err := a.getMasterpass(oldPass)
	if err != nil {
		return ReturnError(err)
	}
	fmt.Println("masterpass", masterpass)
	return ReturnError(
		a.DB.Where("1 = 1").Delete(&Masterpass{}).Error,
		a.ensureMasterPass(newPass, masterpass),
	)
}

func (a *App) Run(addr string) {
	Fatal(http.ListenAndServe(addr, a.Router))
}

func (a *App) initializeRoutes() {
	a.Router = mux.NewRouter()
	a.Router.HandleFunc(vrfPath, a.getVrfs).Methods(http.MethodGet)
	a.Router.HandleFunc(vrfPath, a.createVrf).Methods(http.MethodPost)
	a.Router.HandleFunc(vrfIDPath, a.getVrf).Methods(http.MethodGet)
	a.Router.HandleFunc(vrfIDPath, a.updateVrf).Methods(http.MethodPatch)
	a.Router.HandleFunc(vrfIDPath, a.deleteVrf).Methods(http.MethodDelete)
	a.Router.HandleFunc(monitoringPath, a.monitoring).Methods(http.MethodGet)
	a.Router.HandleFunc(logPath, a.getLogs).Methods(http.MethodGet)
	a.Router.HandleFunc(settingNamePath, a.apiGetSetting).Methods(http.MethodGet)
	a.Router.HandleFunc(settingNamePath, a.apiSetSetting).Methods(http.MethodPost)
	a.Router.HandleFunc(passPath, a.changePassword).Methods(http.MethodPost)
	a.Router.HandleFunc(CAPath, a.setCAs).Methods(http.MethodPost)
	a.Router.HandleFunc(CAPath, a.getCAs).Methods(http.MethodGet)
}

func getPassFromHeader(header http.Header) (string, error) {
	authHeader := header["Authorization"]
	if len(authHeader) == 0 {
		return "", ReturnNewError("no basic auth")
	}
	prefixLen := len("Basic ")
	based := strings.TrimRight(authHeader[0][prefixLen:], "=")
	decodedBasicAuth, err := base64.RawStdEncoding.DecodeString(based)
	if err != nil {
		return "", ReturnError(err)
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
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	api := sico_yang.SicoIpsec_Api{}
	err = sico_yang.Unmarshal(body, &api)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if err := a._changePassword(oldPass, *api.Password); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]interface{}{"status": "ok"})
}

func ClearCAs() error {
	dir, err := ioutil.ReadDir(CAsDir)
	if err != nil {
		return ReturnError(err)
	}
	errs := []error{}
	for _, d := range dir {
		errs = append(errs, os.RemoveAll(path.Join([]string{CAsDir, d.Name()}...)))
	}
	return ReturnError(errs...)
}

func writeCAs(cas []CertificateAuthority) error {
	if err := ClearCAs(); err != nil {
		return ReturnError(err)
	}
	errs := []error{}
	for _, ca := range cas {
		errs = append(errs, ioutil.WriteFile(fmt.Sprintf("%s/%d.pem", CAsDir, ca.ID), []byte(ca.CA), 0644))
	}
	return ReturnError(errs...)
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
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	cas := []CertificateAuthority{}
	for _, caYang := range api.Ca {
		ca := CertificateAuthority{}
		ca.FromYang(caYang)
		cas = append(cas, ca)
	}
	if err := a.DB.Where("1=1").Delete(&CertificateAuthority{}).Error; err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if len(cas) > 0 {
		if err := a.DB.Create(&cas).Error; err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
	}
	if err := writeCAs(cas); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
}

func (a *App) getCAs(w http.ResponseWriter, r *http.Request) {
	cas := []CertificateAuthority{}
	if err := a.DB.Find(&cas).Error; err != nil {
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
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
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
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	settingJson, err := json.Marshal(j["setting"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	setting := sico_yang.SicoIpsec_Api_Setting{}
	if err := sico_yang.Unmarshal(settingJson, &setting); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := a.setSetting(key, name, *setting.Value); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
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
	value, err := a.getSetting(key, name)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	setting := sico_yang.SicoIpsec_Api_Setting{
		Name:  stringPointer(name),
		Value: stringPointer(value),
	}
	json, err := ygot.EmitJSON(&setting, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithMarshalledJSON(w, http.StatusOK, `{"setting":`+json+"}")
}

func (a *App) getVrfs(w http.ResponseWriter, r *http.Request) {
	vrfsMap := map[uint32]*sico_yang.SicoIpsec_Api_Vrf{}
	vrfs, err := getVrfs(a.DB)
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
		if err := a.decryptPSK(key, &v); err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		vrfYang, err := v.ToYang()
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		vrfsMap[v.ID] = vrfYang
	}
	api := sico_yang.SicoIpsec_Api{
		Vrf: vrfsMap,
	}
	json, err := ygot.EmitJSON(&api, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithMarshalledJSON(w, http.StatusOK, json)
}

func (a *App) getVrf(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, "Invalid vrf ID")
		return
	}

	vrf := Vrf{ID: uint32(id)}
	if err := vrf.getVrf(a.DB); err != nil {
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
	if err := a.decryptPSK(key, &vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	vrfYang, err := vrf.ToYang()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	json, err := ygot.EmitJSON(vrfYang, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithMarshalledJSON(w, http.StatusOK, `{"vrf":`+json+`}`)
}

func vrfValid(vrf Vrf) (bool, error) {
	if vrf.ID == hardwareVrfID {
		return true, nil
	}
	if vrf.PhysicalInterface == "" {
		return false, nil
	}
	vlans, err := vrf.getVlans()
	if err != nil {
		return false, ReturnError(err)
	}
	for _, v := range vlans {
		if v.Vlan <= 0 {
			return false, nil
		}
	}
	return true, nil
}

func (a *App) _updateBackends(key string, vrf, oldVrf *Vrf) error {
	createHandler, deleteHandler, err := a.getHandlers(key, *vrf)
	if err != nil {
		return ReturnError(err)
	}

	// save and retrieve the vrf to update the endpoints ids
	if err := a.encryptPSK(key, vrf); err != nil {
		return ReturnError(err)
	}
	if err := vrf.updateVrf(a.DB); err != nil {
		return ReturnError(err)
	}
	if err := vrf.getVrf(a.DB); err != nil {
		return ReturnError(err)
	}
	if err := a.decryptPSK(key, vrf); err != nil {
		return ReturnError(err)
	}

	// handle backends
	if *oldVrf.Active != *vrf.Active {
		if *vrf.Active {
			if err := createHandler(*vrf); err != nil {
				return ReturnError(err)
			}
		} else {
			if err := deleteHandler(*oldVrf); err != nil {
				return ReturnError(err)
			}
		}
	} else if *vrf.Active {
		if err := deleteHandler(*oldVrf); err != nil {
			return ReturnError(err)
		}
		if err := createHandler(*vrf); err != nil {
			return ReturnError(err)
		}
	}
	return nil
}

func (a *App) createVrf(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	j := map[string]interface{}{}
	if err := json.Unmarshal(body, &j); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	vrfJson, err := json.Marshal(j["vrf"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	yangVrf := sico_yang.SicoIpsec_Api_Vrf{}
	if err := sico_yang.Unmarshal(vrfJson, &yangVrf); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	vrf := Vrf{}
	vrf.FromYang(&yangVrf)
	valid, err := vrfValid(vrf)
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
	if err := a.encryptPSK(key, &vrf); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := vrf.createVrf(a.DB); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := a.decryptPSK(key, &vrf); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if err := a._updateBackends(key, &vrf, &Vrf{
		ID:     vrf.ID,
		Active: boolPointer(false),
	}); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, nil)
}

type handler func(Vrf) error

func (a *App) updateVrf(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, "Invalid vrf ID")
		return
	}
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {

		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	j := map[string]interface{}{}
	if err := json.Unmarshal(body, &j); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	vrfJson, err := json.Marshal(j["vrf"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	yangVrf := sico_yang.SicoIpsec_Api_Vrf{}
	if err := sico_yang.Unmarshal(vrfJson, &yangVrf); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	key, err := getPassFromHeader(r.Header)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}
	vrf := Vrf{}
	spew.Dump(yangVrf)
	vrf.FromYang(&yangVrf)

	valid, err := vrfValid(vrf)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if !valid {
		a.respondWithError(w, http.StatusBadRequest, "vrf invalid")
		return
	}
	var oldVrf Vrf
	vrf.ID = uint32(id)
	oldVrf.ID = uint32(id)

	if err := oldVrf.getVrf(a.DB); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if vrf.ID == hardwareVrfID && vrf.ClientName != oldVrf.ClientName {
		// can't change the hardware vrf name
		a.respondWithError(w, http.StatusBadRequest, "Cannot change the hardware vrf name")
		return
	}

	if vrf.Active == nil {
		vrf.Active = oldVrf.Active
	}
	if err := a._updateBackends(key, &vrf, &oldVrf); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, vrf)
}

func (a *App) getSwitchCreds(key string) error {
	var err error
	a.switchUsername, err = a.getSetting(key, "switch_username")
	if err != nil {
		return ReturnError(err)
	}
	a.switchPassword, err = a.getSetting(key, "switch_password")
	if err != nil {
		return ReturnError(err)
	}
	return nil
}

func (a *App) getHandlers(key string, vrf Vrf) (handler, handler, error) {
	if vrf.ID == hardwareVrfID {
		return a.restconfCreate, a.restconfDelete, a.getSwitchCreds(key)
	} else {
		return a.Generator.GenerateTemplates, a.Generator.DeleteTemplates, nil
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

	vrf := Vrf{ID: uint32(id)}
	if err := vrf.getVrf(a.DB); err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_, deleteHandler, err := a.getHandlers(key, vrf)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	err = ReturnError(
		func() error {
			return deleteHandler(vrf)
		}(),
		vrf.deleteVrf(a.DB),
		func() error {
			if id == hardwareVrfID {
				return a.ensureHWVRF()
			}
			return nil
		}(),
	)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
	}
	respondWithJSON(w, http.StatusOK, map[string]string{"result": "success"})
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
		return nil, ReturnError(err)
	}
	defer file.Close()

	stat, err := os.Stat(fname)
	if err != nil {
		return nil, ReturnError(err)
	}
	bytes := min(maxBytes, stat.Size())
	buf := make([]byte, bytes)
	start := stat.Size() - bytes
	n, err := file.ReadAt(buf, start)
	fmt.Println(fname, start, bytes, n)
	if err != nil {
		return nil, ReturnError(err)
	}
	return buf, nil
}

func (a *App) getLogs(w http.ResponseWriter, r *http.Request) {
	processInfos, err := GetProcessInfos()
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
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		api.Log[info.Name] = &sico_yang.SicoIpsec_Api_Log{
			Name: stringPointer(info.Name),
			Log:  stringPointer(string(log)),
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

func (a *App) respondWithError(w http.ResponseWriter, code int, message string) {
	a.storeError(message)
	returnErrorEx(2, fmt.Errorf(message))
	respondWithJSON(w, code, map[string]string{"result": "error", "error": message})
}

func (a *App) storeError(message string) {
	newError := StoredError{}
	newError.Message = message
	newError.ErrorTime = time.Now()
	newError.createError(a.DB)
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if _, err := w.Write(response); err != nil {
		ReturnNewError("Error while writing the response: " + err.Error())
	}
}
