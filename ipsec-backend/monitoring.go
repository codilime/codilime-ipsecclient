package main

import (
	"net/http"

	"github.com/gorilla/mux"
)

func metrics(w http.ResponseWriter, r *http.Request) {
	strongswan, err := GetStrongswanState()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
	}
	supervisor, err := GetSupervisorState()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
	}
	bird, err := GetBirdState()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
	}

	res := map[string]interface{}{
		"strongswan": strongswan,
		"supervisor": supervisor,
		"bird":       bird,
	}
	respondWithJSON(w, http.StatusOK, res)
}

func metricsName(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	name := vars["name"]

	strongswan, err := GetStrongswanSingleState(name)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
	}
	supervisor, err := GetSupervisorSingleState(name)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
	}
	bird, err := GetBirdSingleState(name)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
	}

	res := map[string]interface{}{
		"strongswan": strongswan,
		"supervisor": supervisor,
		"bird":       bird,
	}
	respondWithJSON(w, http.StatusOK, res)
}