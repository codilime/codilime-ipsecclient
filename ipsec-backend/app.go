package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"path"
	"strconv"
	"strings"

	"github.com/foomo/htpasswd"
	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
	"gorm.io/gorm"
)

const (
	vrfsPath        = "/api/vrfs"
	vrfsIDPath      = vrfsPath + "/{id:[0-9]+}"
	metricsPath     = "/api/metrics"
	softwarePath    = "/api/algorithms/software"
	hardwarePathPh1 = "/api/algorithms/hardware/ph1"
	hardwarePathPh2 = "/api/algorithms/hardware/ph2"
	listLogsPath    = "/api/listlogs"
	CAsPath         = "/api/cas"
	settingsPath    = "/api/settings/{name:[a-zA-Z0-9-_]+}"
	logsPath        = "/api/logs/{name:[a-zA-Z0-9-_]+}"
	changePassPath  = "/api/changepass"

	nginxPasswordFile = "/etc/nginx/htpasswd"
	username          = "admin"
	CAsDir            = "/opt/ipsec/x509ca"
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
	a.initializeRestconfRouter()
	a.Router.HandleFunc(vrfsPath, a.getVrfs).Methods(http.MethodGet)
	a.Router.HandleFunc(vrfsPath, a.createVrf).Methods(http.MethodPost)
	a.Router.HandleFunc(vrfsIDPath, a.getVrf).Methods(http.MethodGet)
	a.Router.HandleFunc(vrfsIDPath, a.updateVrf).Methods(http.MethodPut)
	a.Router.HandleFunc(vrfsIDPath, a.deleteVrf).Methods(http.MethodDelete)
	a.Router.HandleFunc(softwarePath, a.getSoftwareAlgorithms).Methods(http.MethodGet)
	a.Router.HandleFunc(hardwarePathPh1, a.getHardwareAlgorithmsPh1).Methods(http.MethodGet)
	a.Router.HandleFunc(hardwarePathPh2, a.getHardwareAlgorithmsPh2).Methods(http.MethodGet)
	a.Router.HandleFunc(settingsPath, a.apiGetSetting).Methods(http.MethodGet)
	a.Router.HandleFunc(settingsPath, a.apiSetSetting).Methods(http.MethodPost)
	a.Router.HandleFunc(logsPath, a.getLogs).Methods(http.MethodGet)
	a.Router.HandleFunc(listLogsPath, a.listLogs).Methods(http.MethodGet)
	a.Router.HandleFunc(changePassPath, a.changePassword).Methods(http.MethodPost)
	a.Router.HandleFunc(CAsPath, a.setCAs).Methods(http.MethodPost)
	a.Router.HandleFunc(CAsPath, a.getCAs).Methods(http.MethodGet)
	a.Router.HandleFunc(metricsPath+"/{id:[0-9]+}", a.metrics).Methods(http.MethodGet)
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
		respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}
	newPass, err := ioutil.ReadAll(r.Body)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := a._changePassword(oldPass, string(newPass)); err != nil {
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
	cas := []CertificateAuthority{}
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := json.Unmarshal(body, &cas); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := a.DB.Where("1=1").Delete(&CertificateAuthority{}).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if len(cas) > 0 {
		if err := a.DB.Create(&cas).Error; err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
	}
	if err := writeCAs(cas); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
}

func (a *App) getCAs(w http.ResponseWriter, r *http.Request) {
	cas := []CertificateAuthority{}
	if err := a.DB.Find(&cas).Error; err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, cas)
}

func (a *App) apiSetSetting(w http.ResponseWriter, r *http.Request) {
	name := mux.Vars(r)["name"]
	if name == "masterpass" {
		respondWithError(w, http.StatusBadRequest, "masterpass cannot be used as a setting name")
		return
	}

	key, err := getPassFromHeader(r.Header)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}
	value, err := ioutil.ReadAll(r.Body)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := a.setSetting(key, name, string(value)); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusCreated, map[string]string{"result": "success", "value": string(value), "name": name})
}

func (a *App) apiGetSetting(w http.ResponseWriter, r *http.Request) {
	name := mux.Vars(r)["name"]
	if name == "masterpass" {
		respondWithError(w, http.StatusBadRequest, "masterpass cannot be used as a setting name")
		return
	}

	key, err := getPassFromHeader(r.Header)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}
	value, err := a.getSetting(key, name)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusCreated, map[string]string{"result": "success", "value": value, "name": name})
}

func (a *App) getVrfs(w http.ResponseWriter, r *http.Request) {
	vrfs, err := getVrfs(a.DB)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	key, err := getPassFromHeader(r.Header)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}
	for i, v := range vrfs {
		err = a.decryptPSK(key, &v)
		if err != nil {
			respondWithError(w, http.StatusUnauthorized, err.Error())
			return
		}
		vrfs[i] = v
	}
	respondWithJSON(w, http.StatusOK, vrfs)
}

func (a *App) getVrf(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid vrf ID")
		return
	}

	vrf := Vrf{ID: id}
	if err := vrf.getVrf(a.DB); err != nil {
		switch err {
		case gorm.ErrRecordNotFound:
			respondWithError(w, http.StatusNotFound, "Vrf not found")
		default:
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}
	key, err := getPassFromHeader(r.Header)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}
	if err := a.decryptPSK(key, &vrf); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, vrf)
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

func (a *App) _createVrf(w http.ResponseWriter, r *http.Request, vrf Vrf) {
	valid, err := vrfValid(vrf)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if !valid {
		respondWithError(w, http.StatusBadRequest, "vrf invalid")
		return
	}

	if vrf.Active == nil {
		vrf.Active = new(bool)
	}
	key, err := getPassFromHeader(r.Header)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}
	plaintextVrf := vrf
	if err := a.encryptPSK(key, &vrf); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := vrf.createVrf(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, plaintextVrf)
}

func (a *App) createVrf(w http.ResponseWriter, r *http.Request) {
	var vrf Vrf
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&vrf); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	defer func() {
		if err := r.Body.Close(); err != nil {
			ReturnNewError("error while closing body: " + err.Error())
		}
	}()

	a._createVrf(w, r, vrf)
}

type handler func(Vrf) error

func (a *App) updateVrf(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid vrf ID")
		return
	}
	key, err := getPassFromHeader(r.Header)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}
	var vrf, oldVrf Vrf
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&vrf); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer func() {
		if err := r.Body.Close(); err != nil {
			ReturnNewError("error while closing body: " + err.Error())
		}
	}()

	valid, err := vrfValid(vrf)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if !valid {
		respondWithError(w, http.StatusBadRequest, "vrf invalid")
		return
	}

	vrf.ID = id
	oldVrf.ID = id

	if err := oldVrf.getVrf(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if vrf.ID == hardwareVrfID && vrf.ClientName != oldVrf.ClientName {
		// can't change the hardware vrf name
		respondWithError(w, http.StatusBadRequest, "Cannot change the hardware vrf name")
		return
	}

	if vrf.Active == nil {
		vrf.Active = oldVrf.Active
	}

	createHandler, deleteHandler, err := a.getHandlers(key, vrf)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// save and retrieve the vrf to update the endpoints ids
	if err := a.encryptPSK(key, &vrf); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := vrf.updateVrf(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := vrf.getVrf(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := a.decryptPSK(key, &vrf); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// handle backends
	if *oldVrf.Active != *vrf.Active {
		if *vrf.Active {
			if err := createHandler(vrf); err != nil {
				respondWithError(w, http.StatusInternalServerError, err.Error())
				return
			}
		} else {
			if err := deleteHandler(oldVrf); err != nil {
				respondWithError(w, http.StatusInternalServerError, err.Error())
				return
			}
		}
	} else if *vrf.Active {
		if err := deleteHandler(oldVrf); err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		if err := createHandler(vrf); err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
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
		respondWithError(w, http.StatusBadRequest, "Invalid Vrf ID")
		return
	}

	key, err := getPassFromHeader(r.Header)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}

	vrf := Vrf{ID: id}
	if err := vrf.getVrf(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_, deleteHandler, err := a.getHandlers(key, vrf)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
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
		respondWithError(w, http.StatusInternalServerError, err.Error())
	}
	respondWithJSON(w, http.StatusOK, map[string]string{"result": "success"})
}

func (a *App) getSoftwareAlgorithms(w http.ResponseWriter, r *http.Request) {
	enc := getSoftwareEncryptionAlgorithms()
	integrity := getSoftwareIntegrityAlgorithms()
	keyExchange := getSoftwareKeyExchangeAlgorithms()

	res := map[string][]string{
		"encryption":   enc,
		"integrity":    integrity,
		"key_exchange": keyExchange,
	}

	respondWithJSON(w, http.StatusOK, res)
}

func (a *App) getHardwareAlgorithmsPh1(w http.ResponseWriter, r *http.Request) {
	enc := getHardwareEncryptionAlgorithmsPh1()
	integrity := getHardwareIntegrityAlgorithmsPh1()
	keyExchange := getHardwareKeyExchangeAlgorithmsPh1()

	res := map[string][]string{
		"encryption":   enc,
		"integrity":    integrity,
		"key_exchange": keyExchange,
	}

	respondWithJSON(w, http.StatusOK, res)
}

func (a *App) getHardwareAlgorithmsPh2(w http.ResponseWriter, r *http.Request) {
	enc := getHardwareEncryptionAlgorithmsPh2()
	integrity := getHardwareIntegrityAlgorithmsPh2()
	keyExchange := getHardwareKeyExchangeAlgorithmsPh2()

	res := map[string][]string{
		"encryption":   enc,
		"integrity":    integrity,
		"key_exchange": keyExchange,
	}

	respondWithJSON(w, http.StatusOK, res)
}

func (a *App) getLogs(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	name := vars["name"]
	offsetStr := r.URL.Query().Get("offset")
	offset, _ := strconv.Atoi(offsetStr)
	res, err := GetProcessLog(name, offset, 4294967296)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, res)
}

func (a *App) listLogs(w http.ResponseWriter, r *http.Request) {
	res, err := GetProcessNames()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, res)
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	returnErrorEx(2, fmt.Errorf(message))
	respondWithJSON(w, code, map[string]string{"result": "error", "error": message})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if _, err := w.Write(response); err != nil {
		ReturnNewError("Error while writing the response: " + err.Error())
	}
}
