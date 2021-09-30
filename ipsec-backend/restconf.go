package main

import (
	"encoding/json"
	"ipsec_backend/sico_yang"
	"net/http"
	"strings"

	"github.com/davecgh/go-spew/spew"
	"github.com/openconfig/ygot/ygot"
)

const restconfBasePath = "/restconf/data/sico-ipsec:api"

func (a *App) initializeRestconfRouter() {
	a.Router.HandleFunc(restconfBasePath+"/vrf", a.restconfGetVrf).Methods(http.MethodGet)
	a.Router.HandleFunc(restconfBasePath+"/vrf", a.restconfPatchVrf).Methods(http.MethodPatch)
}

func (e *Endpoint) ToYang() *sico_yang.SicoIpsec_Api_Vrf_Endpoints {
	as := int64(e.RemoteAS)
	return &sico_yang.SicoIpsec_Api_Vrf_Endpoints{
		Id:              int64Pointer(e.ID),
		VrfId:           int64Pointer(e.VrfID),
		Bgp:             &e.BGP,
		LocalIp:         &e.LocalIP,
		Nat:             &e.NAT,
		PeerIp:          &e.PeerIP,
		RemoteAs:        &as,
		RemoteIpSec:     &e.RemoteIPSec,
		SourceInterface: &e.SourceInterface,
		Authentication: &sico_yang.SicoIpsec_Api_Vrf_Endpoints_Authentication{
			LocalCert:  &e.Authentication.LocalCert,
			PrivateKey: &e.Authentication.PrivateKey,
			Psk:        &e.Authentication.PSK,
			RemoteCert: &e.Authentication.RemoteCert,
			Type:       &e.Authentication.Type,
		},
	}
}

func int64Pointer(i int64) *int64 {
	return &i
}

func (v *Vrf) ToYang() (*sico_yang.SicoIpsec_Api_Vrf, error) {
	cryptoPh1 := []string{}
	if err := json.Unmarshal(v.CryptoPh1, &cryptoPh1); err != nil {
		return nil, ReturnError(err)
	}
	cryptoPh2 := []string{}
	if err := json.Unmarshal(v.CryptoPh2, &cryptoPh2); err != nil {
		return nil, ReturnError(err)
	}
	ph1 := strings.Join(cryptoPh1, "-")
	ph2 := strings.Join(cryptoPh2, "-")
	as := int64(v.LocalAs)
	endpoints := map[int64]*sico_yang.SicoIpsec_Api_Vrf_Endpoints{}
	for _, e := range v.Endpoints {
		endpoints[e.ID] = e.ToYang()
	}
	vlans, err := v.getVlans()
	if err != nil {
		return nil, ReturnError(err)
	}
	vlansMap := map[int64]*sico_yang.SicoIpsec_Api_Vrf_Vlans{}
	for _, v := range vlans {
		vlanID := int64(v.Vlan)
		vlansMap[vlanID] = &sico_yang.SicoIpsec_Api_Vrf_Vlans{
			Vlan:  int64Pointer(vlanID),
			LanIp: &v.LanIP,
		}
	}
	return &sico_yang.SicoIpsec_Api_Vrf{
		Id:                int64Pointer(v.ID),
		Active:            v.Active,
		ClientName:        &v.ClientName,
		CryptoPh1:         &ph1,
		CryptoPh2:         &ph2,
		LocalAs:           &as,
		PhysicalInterface: &v.PhysicalInterface,
		Endpoints:         endpoints,
		Vlans:             vlansMap,
	}, nil
}

func (a *App) restconfGetVrf(w http.ResponseWriter, r *http.Request) {
	vrfsMap := map[int64]*sico_yang.SicoIpsec_Api_Vrf{}
	vrfs, err := getVrfs(a.DB)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	for _, v := range vrfs {
		vrfYang, err := v.ToYang()
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		vrfsMap[v.ID] = vrfYang
	}
	api := sico_yang.SicoIpsec_Api{
		Vrf: vrfsMap,
	}
	spew.Dump(api)
	json, err := ygot.EmitJSON(&api, &ygot.EmitJSONConfig{
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

func (a *App) restconfPatchVrf(w http.ResponseWriter, r *http.Request) {
}

func respondWithMarshalledJSON(w http.ResponseWriter, code int, response string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if _, err := w.Write([]byte(response)); err != nil {
		ReturnNewError("Error while writing the response: " + err.Error())
	}
}
