package main

import (
	"crypto/tls"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

const (
	saStatusStr = "sa_status"
	localIpStr  = "local_ip"
	remoteIpStr = "remote_ip"
	idStr       = "id"
)

func normalizeMetrics(metrics *map[string]interface{}) {
	endpointStatuses := (*metrics)["endpoint_statuses"].([]map[string]interface{})
	for i, endpoint := range endpointStatuses {
		status := endpoint[saStatusStr].(string)
		if status == "ESTABLISHED" || status == "crypto-sa-status-active" {
			endpoint[saStatusStr] = "up"
		} else {
			endpoint[saStatusStr] = "down"
		}
		endpointStatuses[i] = endpoint
	}
	(*metrics)["endpoint_statuses"] = endpointStatuses
}

func (a *App) metrics(w http.ResponseWriter, r *http.Request) {
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

	var res map[string]interface{}
	if vrf.ID != hardwareVrfID {
		res, err = getSWMetrics(vrf)
		if err != nil {
			respondWithError(w, 500, err.Error())
			return
		}
	} else {
		res, err = a.getHWMetrics() // no arguments because there is only one vrf in hw
		if err != nil {
			respondWithError(w, 500, err.Error())
			return
		}
	}
	normalizeMetrics(&res)
	respondWithJSON(w, http.StatusOK, res)
}

func getSWMetrics(vrf Vrf) (map[string]interface{}, error) {
	statuses, err := GetStrongswanSingleState(vrf.ClientName)
	res := map[string]interface{}{
		"endpoint_statuses": statuses,
	}
	return res, ReturnError(err)
}

func (a *App) getHWMetrics() (map[string]interface{}, error) {
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	res, err := a.restconfGetData("Cisco-IOS-XE-crypto-oper:crypto-oper-data/crypto-ikev2-sa", client)
	if err != nil {
		return nil, ReturnError(err)
	}
	endpoints := []map[string]interface{}{}
	if res == nil {
		return map[string]interface{}{
			"endpoint_statuses": endpoints,
		}, nil
	}
	sas := res["Cisco-IOS-XE-crypto-oper:crypto-ikev2-sa"].([]interface{})
	for _, sa := range sas {
		saData := sa.(map[string]interface{})["sa-data"].(map[string]interface{})
		localIp := saData["local-ip-addr"]
		remoteIp := saData["remote-ip-addr"]
		saStatus := saData["sa-status"]
		endpointData := map[string]interface{}{
			localIpStr:  localIp,
			remoteIpStr: remoteIp,
			saStatusStr: saStatus,
		}
		endpoints = append(endpoints, endpointData)
	}
	ret := map[string]interface{}{
		"endpoint_statuses": endpoints,
	}
	return ret, nil
}
