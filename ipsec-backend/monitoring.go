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
	birdBgp, err := GetBirdState()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
	}
	hwBgp, err := GetHWBGP()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
	}

	sumBgp := map[string]string{}
	for k, v := range birdBgp {
		sumBgp[k] = v
	}
	for k, v := range hwBgp {
		sumBgp[k] = v
	}

	res := map[string]interface{}{
		"strongswan": strongswan,
		"supervisor": supervisor,
		"bird":       sumBgp,
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
	routes, err := GetBirdRoutes(name)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
	}

	res := map[string]interface{}{
		"strongswan": strongswan,
		"supervisor": supervisor,
		"bird":       bird,
		"routes":     routes,
	}
	respondWithJSON(w, http.StatusOK, res)
}
