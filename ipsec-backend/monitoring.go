/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package main

import (
	"ipsec_backend/sico_yang"
	"net/http"
	"strconv"

	"ipsec_backend/db"

	"github.com/gorilla/mux"
	"github.com/openconfig/ygot/ygot"
	"gorm.io/gorm"
)

func (a *App) monitoring(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, "bad id: "+idStr)
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
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	switchCreds, err := a.getSwitchCreds(key)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	var monitoring *sico_yang.SicoIpsec_Api_Monitoring
	if vrf.ID != db.HardwareVrfID {
		monitoring, err = a.softwareGenerator.GetMonitoring(&vrf.ClientName)
		if err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
	} else {
		monitoring, err = a.hardwareGenerator.GetMonitoring(nil, *switchCreds)
		if err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
	}
	monitoring.Id = db.Uint32Pointer(uint32(id))
	api := sico_yang.SicoIpsec_Api{
		Monitoring: map[uint32]*sico_yang.SicoIpsec_Api_Monitoring{
			uint32(id): monitoring,
		},
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
