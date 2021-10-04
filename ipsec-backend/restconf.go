package main

import (
	"encoding/json"
	"io/ioutil"
	"ipsec_backend/sico_yang"
	"net/http"
	"strings"

	"github.com/openconfig/ygot/ygot"
)

const restconfBasePath = "/restconf/data/sico-ipsec:api"

func (a *App) initializeRestconfRouter() {
	a.Router.HandleFunc(restconfBasePath+"/vrf", a.restconfGetVrf).Methods(http.MethodGet)
	a.Router.HandleFunc(restconfBasePath+"/vrf", a.restconfPostVrf).Methods(http.MethodPost)
}

func int64Pointer(i int64) *int64 {
	return &i
}

func boolPointer(b bool) *bool {
	return &b
}

func stringPointer(s string) *string {
	return &s
}

func (e *Endpoint) ToYang() *sico_yang.SicoIpsec_Api_Vrf_Endpoints {
	as := int64(e.RemoteAS)
	return &sico_yang.SicoIpsec_Api_Vrf_Endpoints{
		Id:              int64Pointer(e.ID),
		VrfId:           int64Pointer(e.VrfID),
		Bgp:             boolPointer(e.BGP),
		LocalIp:         stringPointer(e.LocalIP),
		Nat:             boolPointer(e.NAT),
		PeerIp:          stringPointer(e.PeerIP),
		RemoteAs:        int64Pointer(as),
		RemoteIpSec:     stringPointer(e.RemoteIPSec),
		SourceInterface: stringPointer(e.SourceInterface),
		Authentication: &sico_yang.SicoIpsec_Api_Vrf_Endpoints_Authentication{
			LocalCert:  stringPointer(e.Authentication.LocalCert),
			PrivateKey: stringPointer(e.Authentication.PrivateKey),
			Psk:        stringPointer(e.Authentication.PSK),
			RemoteCert: stringPointer(e.Authentication.RemoteCert),
			Type:       stringPointer(e.Authentication.Type),
		},
	}
}

func (e *Endpoint) FromYang(endVrf *sico_yang.SicoIpsec_Api_Vrf_Endpoints) {
	e.ID = *endVrf.Id
	e.VrfID = *endVrf.VrfId
	e.RemoteIPSec = *endVrf.RemoteIpSec
	e.LocalIP = *endVrf.LocalIp
	e.PeerIP = *endVrf.PeerIp
	e.RemoteAS = int(*endVrf.RemoteAs)
	e.NAT = *endVrf.Nat
	e.BGP = *endVrf.Bgp
	e.SourceInterface = *endVrf.SourceInterface
	e.Authentication = EndpointAuth{
		Type:       *endVrf.Authentication.Type,
		PSK:        *endVrf.Authentication.Psk,
		LocalCert:  *endVrf.Authentication.LocalCert,
		RemoteCert: *endVrf.Authentication.RemoteCert,
		PrivateKey: *endVrf.Authentication.PrivateKey,
	}
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
			LanIp: stringPointer(v.LanIP),
		}
	}
	return &sico_yang.SicoIpsec_Api_Vrf{
		Id:                int64Pointer(v.ID),
		Active:            boolPointer(*v.Active),
		ClientName:        stringPointer(v.ClientName),
		CryptoPh1:         stringPointer(ph1),
		CryptoPh2:         stringPointer(ph2),
		LocalAs:           int64Pointer(as),
		PhysicalInterface: stringPointer(v.PhysicalInterface),
		Endpoints:         endpoints,
		Vlans:             vlansMap,
	}, nil
}

func (v *Vrf) FromYang(vrfYang *sico_yang.SicoIpsec_Api_Vrf) error {
	v.ID = *vrfYang.Id
	v.ClientName = *vrfYang.ClientName
	vlans := []interface{}{}
	for _, v := range vrfYang.Vlans {
		vlans = append(vlans, Vlan{
			Vlan:  int(*v.Vlan),
			LanIP: *v.LanIp,
		})
	}
	var err error
	v.Vlans, err = json.Marshal(&vlans)
	if err != nil {
		return ReturnError(err)
	}
	cryptoPh1 := strings.Split(*vrfYang.CryptoPh1, "-")
	v.CryptoPh1, err = json.Marshal(&cryptoPh1)
	if err != nil {
		return ReturnError(err)
	}
	cryptoPh2 := strings.Split(*vrfYang.CryptoPh2, "-")
	v.CryptoPh2, err = json.Marshal(&cryptoPh2)
	if err != nil {
		return ReturnError(err)
	}
	v.PhysicalInterface = *vrfYang.PhysicalInterface
	v.Active = vrfYang.Active
	v.LocalAs = int(*vrfYang.LocalAs)
	for _, e := range vrfYang.Endpoints {
		end := Endpoint{}
		end.FromYang(e)
		v.Endpoints = append(v.Endpoints, end)
	}
	return nil
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

func (a *App) restconfPostVrf(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	j := map[string]interface{}{}
	if err := json.Unmarshal(body, &j); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	vrfJson, err := json.Marshal(j["sico-ipsec:vrf"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	yangVrf := sico_yang.SicoIpsec_Api_Vrf{}
	if err := sico_yang.Unmarshal(vrfJson, &yangVrf); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	vrf := Vrf{}
	vrf.FromYang(&yangVrf)
	a._createVrf(w, r, vrf)
}

func respondWithMarshalledJSON(w http.ResponseWriter, code int, response string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if _, err := w.Write([]byte(response)); err != nil {
		ReturnNewError("Error while writing the response: " + err.Error())
	}
}
