package main

import (
	"crypto/tls"
	"ipsec_backend/sico_yang"
	"net/http"
	"strconv"

	"github.com/davecgh/go-spew/spew"
	"github.com/gorilla/mux"
	"github.com/openconfig/ygot/ygot"
	"gorm.io/gorm"
)

func normalizeStatus(status string) string {
	if status == "ESTABLISHED" || status == "crypto-sa-status-active" {
		return "up"
	} else {
		return "down"
	}
}

func (a *App) monitoring(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		a.respondWithError(w, http.StatusBadRequest, "bad id: "+idStr)
	}

	vrf := Vrf{ID: int64(id)}
	if err := vrf.getVrf(a.DB); err != nil {
		switch err {
		case gorm.ErrRecordNotFound:
			a.respondWithError(w, http.StatusNotFound, "Vrf not found")
		default:
			a.respondWithError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	var monitoring *sico_yang.SicoIpsec_Api_Monitoring
	if vrf.ID != hardwareVrfID {
		monitoring, err = GetStrongswanSingleState(vrf.ClientName)
		if err != nil {
			a.respondWithError(w, 500, err.Error())
			return
		}
	} else {
		monitoring, err = a.getHWMetrics() // no arguments because there is only one vrf in hw
		if err != nil {
			a.respondWithError(w, 500, err.Error())
			return
		}
	}
	monitoring.Id = int64Pointer(int64(id))
	ret := sico_yang.SicoIpsec_Api{
		Monitoring: map[int64]*sico_yang.SicoIpsec_Api_Monitoring{
			int64(id): monitoring,
		},
	}
	spew.Dump(ret)
	json, err := ygot.EmitJSON(&ret, &ygot.EmitJSONConfig{
		Format: ygot.RFC7951,
		Indent: "  ",
		RFC7951Config: &ygot.RFC7951JSONConfig{
			AppendModuleName: true,
		},
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithMarshalledJSON(w, http.StatusOK, json)
}

func (a *App) getHWMetrics() (*sico_yang.SicoIpsec_Api_Monitoring, error) {
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	res, err := a.restconfGetData("Cisco-IOS-XE-crypto-oper:crypto-oper-data/crypto-ipsec-ident", client)
	if err != nil {
		return nil, ReturnError(err)
	}
	if res == nil {
		return &sico_yang.SicoIpsec_Api_Monitoring{}, nil
	}
	idents := res["Cisco-IOS-XE-crypto-oper:crypto-ipsec-ident"].([]interface{})
	ret := sico_yang.SicoIpsec_Api_Monitoring{}
	for _, ident_ := range idents {
		ident := ident_.(map[string]interface{})
		endpointIDStr := ident["interface"].(string)[len("Tunnel"):]
		endpointID, _ := strconv.Atoi(endpointIDStr)
		identData := ident["ident-data"].(map[string]interface{})
		localIp := identData["local-endpt-addr"].(string)
		remoteIp := identData["remote-endpt-addr"].(string)
		saStatus := identData["inbound-esp-sa"].(map[string]interface{})["sa-status"].(string)
		ret.Endpoint[int64(endpointID)] = &sico_yang.SicoIpsec_Api_Monitoring_Endpoint{
			LocalIp: stringPointer(localIp),
			PeerIp:  stringPointer(remoteIp),
			Status:  stringPointer(normalizeStatus(saStatus)),
			Id:      int64Pointer(int64(endpointID)),
		}
	}
	return &ret, nil
}
