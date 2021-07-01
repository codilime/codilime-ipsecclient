package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

const (
	vrfsPath        = "/api/vrfs"
	vrfsIDPath      = vrfsPath + "/{id:[0-9]+}"
	metricsPath     = "/api/metrics"
	softwarePath    = "/api/algorithms/software"
	hardwarePathPh1 = "/api/algorithms/hardware/ph1"
	hardwarePathPh2 = "/api/algorithms/hardware/ph2"
	logsPath        = "/api/logs/{name:[a-zA-Z0-9-_]+}"
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

func (a *App) Initialize(dbName string) {
	var err error
	a.DB, err = initializeDB(dbName)
	if err != nil {
		log.Fatal(err)
	}

	a.Generator = FileGenerator{}

	a.initializeRoutes()
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
	a.Router.HandleFunc(metricsPath, metrics).Methods(http.MethodGet)
	a.Router.HandleFunc(metricsPath+"/{name:[a-zA-Z0-9-_]+}", metricsName).Methods(http.MethodGet)
}

func (a *App) getVrfs(w http.ResponseWriter, _ *http.Request) {
	vrfs, err := getVrfs(a.DB)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
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

	respondWithJSON(w, http.StatusOK, vrf)
}

func (a *App) createVrf(w http.ResponseWriter, r *http.Request) {
	var vrf Vrf
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

	if vrf.Active == nil {
		vrf.Active = new(bool)
	}
	if vrf.HardwareSupport == nil {
		vrf.HardwareSupport = new(bool)
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

	if err := vrf.updateVrf(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if vrf.Active == nil {
		vrf.Active = oldVrf.Active
	}
	if vrf.HardwareSupport == nil {
		vrf.HardwareSupport = oldVrf.HardwareSupport
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

	respondWithJSON(w, http.StatusOK, vrf)
}

func (a *App) getHandlers(vrf Vrf) (handler, handler) {
	if *vrf.HardwareSupport {
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
	log.Errorf("Error occurred: %s", message)
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if _, err := w.Write(response); err != nil {
		log.Errorf("Error while writing the response: %v", err)
	}
}
