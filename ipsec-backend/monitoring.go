package main

import (
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
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

func (a *App) metricsName(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "bad id: "+idStr)
	}

	vrf := Vrf{ID: int64(id)}
	if err := vrf.getVrf(a.DB); err != nil {
		switch err {
		case gorm.ErrRecordNotFound:
			respondWithError(w, http.StatusNotFound, "Vrf not found")
		default:
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	supervisor, err := GetSupervisorSingleState(vrf.ClientName)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
	}

	if !*vrf.HardwareSupport {
		strongswan, err := GetStrongswanSingleState(vrf.ClientName)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		bird, err := GetBirdSingleState(vrf.ClientName)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		routes, err := GetBirdRoutes(vrf.ClientName)
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
	} else {
		hwNeighbors, err := GetHWRoutes() // no arguments because there is only 1 vrf in the hardware
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		res := map[string]interface{}{
			"strongswan": []string{},
			"supervisor": supervisor,
			"bird":       []string{},
			"routes":     hwNeighbors,
		}
		respondWithJSON(w, http.StatusOK, res)
	}
}
