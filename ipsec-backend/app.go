package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/foomo/htpasswd"
	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

const (
	vrfsPath          = "/api/vrfs"
	vrfsIDPath        = vrfsPath + "/{id:[0-9]+}"
	metricsPath       = "/api/metrics"
	softwarePath      = "/api/algorithms/software"
	hardwarePathPh1   = "/api/algorithms/hardware/ph1"
	hardwarePathPh2   = "/api/algorithms/hardware/ph2"
	logsPath          = "/api/logs/{name:[a-zA-Z0-9-_]+}"
	nginxPasswordFile = "/etc/nginx/htpasswd"
)

type Generator interface {
	GenerateTemplates(v Vrf) error
	DeleteTemplates(v Vrf) error
}

type App struct {
	Router    *mux.Router
	DB        *gorm.DB
	Generator Generator
}

func boolPointer(b bool) *bool {
	return &b
}

func (a *App) Initialize(dbName string) error {
	var err error
	a.DB, err = initializeDB(dbName)
	if err != nil {
		log.Fatal(err)
	}

	a.Generator = FileGenerator{}

	a.initializeRoutes()

	err = setNginxPassword()
	if err != nil {
		log.Fatal(err)
	}

	hwVrf := Vrf{
		ID:         hardwareVrfID,
		ClientName: "hardware",
		CryptoPh1:  []byte("[\"aes-cbc-128\", \"sha256\", \"fourteen\"]"),
		CryptoPh2:  []byte("[\"esp-aes\", \"esp-sha-hmac\", \"group14\"]"),
		Active:     boolPointer(false),
		Endpoints:  []byte("[]"),
	}

	if err := hwVrf.getVrf(a.DB); err != nil {
		if strings.Contains(err.Error(), "record not found") {
			return hwVrf.createVrf(a.DB)
		}
	}

	return nil
}

func setNginxPassword() error {
	name := "admin"
	password := "cisco123"
	return htpasswd.SetPassword(nginxPasswordFile, name, password, htpasswd.HashBCrypt)
}

func (a *App) Run(addr string) {
	log.Fatal(http.ListenAndServe(addr, a.Router))
}

func (a *App) initializeRoutes() {
	a.Router = mux.NewRouter()
	a.Router.HandleFunc(vrfsPath, a.getVrfs).Methods(http.MethodGet)
	a.Router.HandleFunc(vrfsPath, a.createVrf).Methods(http.MethodPost)
	a.Router.HandleFunc(vrfsIDPath, a.getVrf).Methods(http.MethodGet)
	a.Router.HandleFunc(vrfsIDPath, a.updateVrf).Methods(http.MethodPut)
	a.Router.HandleFunc(vrfsIDPath, a.deleteVrf).Methods(http.MethodDelete)
	a.Router.HandleFunc(softwarePath, a.getSoftwareAlgorithms).Methods(http.MethodGet)
	a.Router.HandleFunc(hardwarePathPh1, a.getHardwareAlgorithmsPh1).Methods(http.MethodGet)
	a.Router.HandleFunc(hardwarePathPh2, a.getHardwareAlgorithmsPh2).Methods(http.MethodGet)
	a.Router.HandleFunc(logsPath, a.getLogs).Methods(http.MethodGet).Queries("offset", "{offset:[-0-9]+}", "length", "{length:[-0-9]+}")
	a.Router.HandleFunc(metricsPath+"/{id:[0-9]+}", a.metrics).Methods(http.MethodGet)
}

func getPassFromHeader(header http.Header) (string, error) {
	authHeader := header["Authorization"]
	if len(authHeader) == 0 {
		return "", fmt.Errorf("no basic auth")
	}
	fmt.Println("get pass from header:", authHeader[0])
	prefixLen := len("Basic ")
	based := strings.TrimRight(authHeader[0][prefixLen:], "=")
	fmt.Println(based)
	decodedBasicAuth, err := base64.RawStdEncoding.DecodeString(based)
	if err != nil {
		return "", err
	}
	return strings.Split(string(decodedBasicAuth), ":")[1], nil
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
	for _, v := range vrfs {
		err = decryptPSK(key, &v)
		if err != nil {
			respondWithError(w, http.StatusUnauthorized, err.Error())
			return
		}
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
	if err := decryptPSK(key, &vrf); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, vrf)
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
			log.Errorf("error while closing body: %v", err)
		}
	}()

	if vrf.Active == nil {
		vrf.Active = new(bool)
	}
	key, err := getPassFromHeader(r.Header)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}
	if err := encryptPSK(key, &vrf); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := vrf.createVrf(a.DB); err != nil {
		log.Infof("error %+v", err)
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, vrf)
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
			log.Errorf("error while closing body: %v", err)
		}
	}()

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

	createHandler, deleteHandler := a.getHandlers(vrf)

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
	if err := encryptPSK(key, &vrf); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if err := vrf.updateVrf(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, vrf)
}

func (a *App) getHandlers(vrf Vrf) (handler, handler) {
	if vrf.ID == hardwareVrfID {
		return restconfCreate, restconfDelete
	} else {
		return a.Generator.GenerateTemplates, a.Generator.DeleteTemplates
	}
}

func (a *App) deleteVrf(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Vrf ID")
		return
	}

	if id == hardwareVrfID {
		respondWithError(w, http.StatusBadRequest, "Cannot remote the hardware VRF")
		return
	}

	vrf := Vrf{ID: id}
	if err := vrf.getVrf(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	_, deleteHandler := a.getHandlers(vrf)
	if *vrf.Active {
		if err := deleteHandler(vrf); err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
	}
	if err := vrf.deleteVrf(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
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
	offset, err := strconv.Atoi(vars["offset"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid offset")
		return
	}
	length, err := strconv.Atoi(vars["length"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid length")
		return
	}
	name := vars["name"]
	res, err := GetProcessLog(name, offset, length)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, res)
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"result": "error", "error": message})
	log.Error("Error occurred: %s", message)
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if _, err := w.Write(response); err != nil {
		log.Errorf("Error while writing the response: %v", err)
	}
}
