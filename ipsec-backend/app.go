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
	vrfsPath   = "/api/vrfs"
	vrfsIDPath = vrfsPath + "/{id:[0-9]+}"
)

type App struct {
	Router *mux.Router
	DB     *gorm.DB
}

func (a *App) Initialize(dbName string) {
	var err error
	a.DB, err = initializeDB(dbName)
	if err != nil {
		log.Fatal(err)
	}

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

	p := Vrf{ID: id}
	if err := p.getVrf(a.DB); err != nil {
		switch err {
		case gorm.ErrRecordNotFound:
			respondWithError(w, http.StatusNotFound, "Vrf not found")
		default:
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	respondWithJSON(w, http.StatusOK, p)
}

func (a *App) createVrf(w http.ResponseWriter, r *http.Request) {
	var p Vrf
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&p); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer func() {
		if err := r.Body.Close(); err != nil {
			log.Errorf("error while closing body: %v", err)
		}
	}()

	if err := p.createVrf(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, p)
}

func (a *App) updateVrf(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid vrf ID")
		return
	}

	var p Vrf
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&p); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer func() {
		if err := r.Body.Close(); err != nil {
			log.Errorf("error while closing body: %v", err)
		}
	}()

	p.ID = id

	if err := p.updateVrf(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, p)
}

func (a *App) deleteVrf(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid Vrf ID")
		return
	}

	p := Vrf{ID: id}
	if err := p.deleteVrf(a.DB); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"result": "success"})
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"result": "error", "error": message})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if _, err := w.Write(response); err != nil {
		log.Errorf("Error while writing the response: %v", err)
	}
}
