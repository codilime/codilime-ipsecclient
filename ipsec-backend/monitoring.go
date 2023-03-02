/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package main

import (
	"errors"
	"fmt"
	"ipsec_backend/ipsecclient_yang"
	"net/http"
	"strconv"

	"ipsec_backend/db"

	"github.com/gorilla/mux"
	"github.com/openconfig/ygot/ygot"
	"gorm.io/gorm"
)

func (a *App) monitoring(w http.ResponseWriter, r *http.Request) {
	a.log.Info("monitoring invoked")

	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, errors.New(fmt.Sprintf("unparsable id: %s", idStr)), a.log)
	}

	vrf := db.Vrf{ID: uint32(id)}
	if err := a.db.GetVrf(&vrf); err != nil {
		switch err {
		case gorm.ErrRecordNotFound:
			a.respondWithError(w, http.StatusNotFound, errors.New("vrf not found"), a.log)
		default:
			a.respondWithError(w, http.StatusInternalServerError, err, a.log)
		}

		return
	}

	key, err := getPassFromHeader(r.Header, a.log)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err, a.log)

		return
	}

	switchCreds, err := a.getSwitchCreds(key)
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err, a.log)

		return
	}

	var monitoring *ipsecclient_yang.Ipsecclient_Api_Monitoring
	if vrf.ID != db.HardwareVrfID {
		monitoring, err = a.softwareGenerator.GetMonitoring(&vrf.ClientName)
		if err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err, a.log)

			return
		}
	} else {
		monitoring, err = a.hardwareGenerator.GetMonitoring(nil, *switchCreds)
		if err != nil {
			a.respondWithError(w, http.StatusInternalServerError, err, a.log)

			return
		}
	}

	monitoring.Id = db.Uint32Pointer(uint32(id))
	api := ipsecclient_yang.Ipsecclient_Api{
		Monitoring: map[uint32]*ipsecclient_yang.Ipsecclient_Api_Monitoring{
			uint32(id): monitoring,
		},
	}

	json, err := ygot.EmitJSON(&api, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
	})
	if err != nil {
		a.respondWithError(w, http.StatusInternalServerError, err, a.log)

		return
	}

	respondWithMarshalledJSON(w, http.StatusOK, json, a.log)
}
