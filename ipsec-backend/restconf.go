package main

import (
	"encoding/json"
	"ipsec_backend/sico_yang"
	"net/http"
	"strings"
)

func uint32Pointer(i uint32) *uint32 {
	return &i
}

func boolPointer(b bool) *bool {
	return &b
}

func stringPointer(s string) *string {
	return &s
}

func (e *Endpoint) ToYang() *sico_yang.SicoIpsec_Api_Vrf_Endpoint {
	return &sico_yang.SicoIpsec_Api_Vrf_Endpoint{
		Id:              uint32Pointer(e.ID),
		VrfId:           uint32Pointer(e.VrfID),
		Bgp:             boolPointer(e.BGP),
		LocalIp:         stringPointer(e.LocalIP),
		Nat:             boolPointer(e.NAT),
		PeerIp:          stringPointer(e.PeerIP),
		RemoteAs:        uint32Pointer(e.RemoteAS),
		RemoteIpSec:     stringPointer(e.RemoteIPSec),
		SourceInterface: stringPointer(e.SourceInterface),
		Authentication: &sico_yang.SicoIpsec_Api_Vrf_Endpoint_Authentication{
			LocalCert:    stringPointer(e.Authentication.LocalCert),
			PrivateKey:   stringPointer(e.Authentication.PrivateKey),
			Psk:          stringPointer(e.Authentication.PSK),
			RemoteCert:   stringPointer(e.Authentication.RemoteCert),
			Pkcs12Base64: stringPointer(e.Authentication.Pkcs12Base64),
			Type:         stringPointer(e.Authentication.Type),
		},
	}
}

func stringIfNotNil(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func (e *Endpoint) FromYang(endVrf *sico_yang.SicoIpsec_Api_Vrf_Endpoint) {
	e.RemoteIPSec = *endVrf.RemoteIpSec
	e.LocalIP = *endVrf.LocalIp
	e.PeerIP = *endVrf.PeerIp
	e.RemoteAS = *endVrf.RemoteAs
	e.NAT = *endVrf.Nat
	e.BGP = *endVrf.Bgp
	e.SourceInterface = *endVrf.SourceInterface
	e.Authentication = EndpointAuth{
		Type:         stringIfNotNil(endVrf.Authentication.Type),
		PSK:          stringIfNotNil(endVrf.Authentication.Psk),
		LocalCert:    stringIfNotNil(endVrf.Authentication.LocalCert),
		RemoteCert:   stringIfNotNil(endVrf.Authentication.RemoteCert),
		PrivateKey:   stringIfNotNil(endVrf.Authentication.PrivateKey),
		Pkcs12Base64: stringIfNotNil(endVrf.Authentication.Pkcs12Base64),
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
	ph1 := strings.Join(cryptoPh1, ".")
	ph2 := strings.Join(cryptoPh2, ".")
	endpoints := map[string]*sico_yang.SicoIpsec_Api_Vrf_Endpoint{}
	for _, e := range v.Endpoints {
		endpoints[e.RemoteIPSec] = e.ToYang()
	}
	vlans, err := v.getVlans()
	if err != nil {
		return nil, ReturnError(err)
	}
	vlansMap := map[uint32]*sico_yang.SicoIpsec_Api_Vrf_Vlan{}
	for _, v := range vlans {
		vlansMap[v.Vlan] = &sico_yang.SicoIpsec_Api_Vrf_Vlan{
			Vlan:  uint32Pointer(v.Vlan),
			LanIp: stringPointer(v.LanIP),
		}
	}
	return &sico_yang.SicoIpsec_Api_Vrf{
		Id:                uint32Pointer(v.ID),
		Active:            boolPointer(*v.Active),
		ClientName:        stringPointer(v.ClientName),
		CryptoPh1:         stringPointer(ph1),
		CryptoPh2:         stringPointer(ph2),
		LocalAs:           uint32Pointer(v.LocalAs),
		PhysicalInterface: stringPointer(v.PhysicalInterface),
		Endpoint:          endpoints,
		Vlan:              vlansMap,
	}, nil
}

func (c *CertificateAuthority) FromYang(caYang *sico_yang.SicoIpsec_Api_Ca) {
	c.CA = *caYang.CaFile
	c.ID = *caYang.Id
}

func (c *CertificateAuthority) ToYang() *sico_yang.SicoIpsec_Api_Ca {
	return &sico_yang.SicoIpsec_Api_Ca{
		Id:     uint32Pointer(c.ID),
		CaFile: stringPointer(c.CA),
	}
}

func (v *Vrf) FromYang(vrfYang *sico_yang.SicoIpsec_Api_Vrf) error {
	v.ClientName = *vrfYang.ClientName
	vlans := []interface{}{}
	for _, v := range vrfYang.Vlan {
		vlans = append(vlans, Vlan{
			Vlan:  *v.Vlan,
			LanIP: *v.LanIp,
		})
	}
	var err error
	v.Vlans, err = json.Marshal(&vlans)
	if err != nil {
		return ReturnError(err)
	}
	cryptoPh1 := strings.Split(*vrfYang.CryptoPh1, ".")
	v.CryptoPh1, err = json.Marshal(&cryptoPh1)
	if err != nil {
		return ReturnError(err)
	}
	v.CryptoPh2, err = json.Marshal(strings.Split(*vrfYang.CryptoPh2, "."))
	if err != nil {
		return ReturnError(err)
	}
	v.PhysicalInterface = *vrfYang.PhysicalInterface
	v.Active = vrfYang.Active
	v.LocalAs = *vrfYang.LocalAs
	for _, e := range vrfYang.Endpoint {
		end := Endpoint{}
		end.FromYang(e)
		v.Endpoints = append(v.Endpoints, end)
	}
	return nil
}

func respondWithMarshalledJSON(w http.ResponseWriter, code int, response string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if _, err := w.Write([]byte(response)); err != nil {
		ReturnNewError("Error while writing the response: " + err.Error())
	}
}

func (e *StoredError) ToYang() *sico_yang.SicoIpsec_Api_Error {
	return &sico_yang.SicoIpsec_Api_Error{
		Id:      uint32Pointer(e.ID),
		Message: stringPointer(e.Message),
		Time:    stringPointer(e.ErrorTime.Format(timeFormat)),
	}
}
