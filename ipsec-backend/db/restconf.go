/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package db

import (
	"encoding/json"
	"ipsec_backend/ipsecclient_yang"
	"ipsec_backend/logger"
	"strings"
)

const timeFormat = "2006-01-02 15:04:01 -0700"

func Uint32Pointer(i uint32) *uint32 {
	return &i
}

func BoolPointer(b *bool) *bool {
	ret := false
	if b == nil {
		return &ret
	}
	ret = *b
	return &ret
}

func StringPointer(s string) *string {
	return &s
}

func (e *Endpoint) ToYang() *ipsecclient_yang.Ipsecclient_Api_Vrf_Endpoint {
	return &ipsecclient_yang.Ipsecclient_Api_Vrf_Endpoint{
		Id:              Uint32Pointer(e.ID),
		VrfId:           Uint32Pointer(e.VrfID),
		Bgp:             BoolPointer(&e.BGP),
		LocalIp:         StringPointer(e.LocalIP),
		Nat:             BoolPointer(&e.NAT),
		PeerIp:          StringPointer(e.PeerIP),
		RemoteAs:        Uint32Pointer(e.RemoteAS),
		RemoteIpSec:     StringPointer(e.RemoteIPSec),
		SourceInterface: StringPointer(e.SourceInterface),
		Authentication: &ipsecclient_yang.Ipsecclient_Api_Vrf_Endpoint_Authentication{
			LocalCert:    StringPointer(e.Authentication.LocalCert),
			PrivateKey:   StringPointer(e.Authentication.PrivateKey),
			LocalId:      StringPointer(e.Authentication.LocalID),
			Psk:          StringPointer(e.Authentication.PSK),
			RemoteCert:   StringPointer(e.Authentication.RemoteCert),
			Pkcs12Base64: StringPointer(e.Authentication.Pkcs12Base64),
			Type:         StringPointer(e.Authentication.Type),
		},
	}
}

func stringIfNotNil(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func (e *Endpoint) FromYang(endVrf *ipsecclient_yang.Ipsecclient_Api_Vrf_Endpoint) {
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
		LocalID:      stringIfNotNil(endVrf.Authentication.LocalId),
		LocalCert:    stringIfNotNil(endVrf.Authentication.LocalCert),
		RemoteCert:   stringIfNotNil(endVrf.Authentication.RemoteCert),
		PrivateKey:   stringIfNotNil(endVrf.Authentication.PrivateKey),
		Pkcs12Base64: stringIfNotNil(endVrf.Authentication.Pkcs12Base64),
	}
}

func (v *Vrf) ToYang() (*ipsecclient_yang.Ipsecclient_Api_Vrf, error) {
	cryptoPh1 := []string{}
	if err := json.Unmarshal(v.CryptoPh1, &cryptoPh1); err != nil {
		return nil, logger.ReturnError(err)
	}
	cryptoPh2 := []string{}
	if err := json.Unmarshal(v.CryptoPh2, &cryptoPh2); err != nil {
		return nil, logger.ReturnError(err)
	}
	ph1 := strings.Join(cryptoPh1, ".")
	ph2 := strings.Join(cryptoPh2, ".")
	endpoints := map[string]*ipsecclient_yang.Ipsecclient_Api_Vrf_Endpoint{}
	for _, e := range v.Endpoints {
		endpoints[e.RemoteIPSec] = e.ToYang()
	}
	vlans, err := v.GetVlans()
	if err != nil {
		return nil, logger.ReturnError(err)
	}
	vlansMap := map[uint32]*ipsecclient_yang.Ipsecclient_Api_Vrf_Vlan{}
	for _, v := range vlans {
		vlansMap[v.Vlan] = &ipsecclient_yang.Ipsecclient_Api_Vrf_Vlan{
			Vlan:  Uint32Pointer(v.Vlan),
			LanIp: StringPointer(v.LanIP),
		}
	}
	return &ipsecclient_yang.Ipsecclient_Api_Vrf{
		Id:                Uint32Pointer(v.ID),
		Active:            BoolPointer(v.Active),
		ClientName:        StringPointer(v.ClientName),
		CryptoPh1:         StringPointer(ph1),
		CryptoPh2:         StringPointer(ph2),
		LocalAs:           Uint32Pointer(v.LocalAs),
		PhysicalInterface: StringPointer(v.PhysicalInterface),
		DisablePeerIps:    BoolPointer(v.DisablePeerIps),
		Endpoint:          endpoints,
		Vlan:              vlansMap,
		Ospf:              BoolPointer(v.OSPF),
	}, nil
}

func (c *CertificateAuthority) FromYang(caYang *ipsecclient_yang.Ipsecclient_Api_Ca) {
	c.CA = *caYang.CaFile
	c.ID = *caYang.Id
}

func (c *CertificateAuthority) ToYang() *ipsecclient_yang.Ipsecclient_Api_Ca {
	return &ipsecclient_yang.Ipsecclient_Api_Ca{
		Id:     Uint32Pointer(c.ID),
		CaFile: StringPointer(c.CA),
	}
}

func (v *Vrf) FromYang(vrfYang *ipsecclient_yang.Ipsecclient_Api_Vrf) error {
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
		return logger.ReturnError(err)
	}
	cryptoPh1 := strings.Split(*vrfYang.CryptoPh1, ".")
	v.CryptoPh1, err = json.Marshal(&cryptoPh1)
	if err != nil {
		return logger.ReturnError(err)
	}
	v.CryptoPh2, err = json.Marshal(strings.Split(*vrfYang.CryptoPh2, "."))
	if err != nil {
		return logger.ReturnError(err)
	}
	v.PhysicalInterface = *vrfYang.PhysicalInterface
	v.Active = vrfYang.Active
	v.LocalAs = *vrfYang.LocalAs
	v.DisablePeerIps = vrfYang.DisablePeerIps
	for _, e := range vrfYang.Endpoint {
		end := Endpoint{}
		end.FromYang(e)
		v.Endpoints = append(v.Endpoints, end)
	}
	v.OSPF = vrfYang.Ospf
	return nil
}

func (e *StoredError) ToYang() *ipsecclient_yang.Ipsecclient_Api_Error {
	return &ipsecclient_yang.Ipsecclient_Api_Error{
		Id:      Uint32Pointer(e.ID),
		Message: StringPointer(e.Message),
		Time:    StringPointer(e.ErrorTime.Format(timeFormat)),
	}
}

func SourceInterfacesToYang(sourceInterfaces []string) []*ipsecclient_yang.Ipsecclient_Api_SourceInterface {
	yangSourceInterface := []*ipsecclient_yang.Ipsecclient_Api_SourceInterface{}
	for _, sourceInterface := range sourceInterfaces {
		yangSourceInterface = append(yangSourceInterface, &ipsecclient_yang.Ipsecclient_Api_SourceInterface{Name: StringPointer(sourceInterface)})
	}
	return yangSourceInterface
}

func phase1EncryptionToYang(algorithms []string) []*ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_1Encryption {
	yangAlgorithms := []*ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_1Encryption{}
	for _, algorithm := range algorithms {
		yangAlgorithms = append(yangAlgorithms, &ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_1Encryption{Name: StringPointer(algorithm)})
	}
	return yangAlgorithms
}

func phase1IntegrityToYang(algorithms []string) []*ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_1Integrity {
	yangAlgorithms := []*ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_1Integrity{}
	for _, algorithm := range algorithms {
		yangAlgorithms = append(yangAlgorithms, &ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_1Integrity{Name: StringPointer(algorithm)})
	}
	return yangAlgorithms
}

func phase1KeyExchangeToYang(algorithms []string) []*ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_1KeyExchange {
	yangAlgorithms := []*ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_1KeyExchange{}
	for _, algorithm := range algorithms {
		yangAlgorithms = append(yangAlgorithms, &ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_1KeyExchange{Name: StringPointer(algorithm)})
	}
	return yangAlgorithms
}

func phase2EncryptionToYang(algorithms []string) []*ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_2Encryption {
	yangAlgorithms := []*ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_2Encryption{}
	for _, algorithm := range algorithms {
		yangAlgorithms = append(yangAlgorithms, &ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_2Encryption{Name: StringPointer(algorithm)})
	}
	return yangAlgorithms
}

func phase2IntegrityToYang(algorithms []string) []*ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_2Integrity {
	yangAlgorithms := []*ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_2Integrity{}
	for _, algorithm := range algorithms {
		yangAlgorithms = append(yangAlgorithms, &ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_2Integrity{Name: StringPointer(algorithm)})
	}
	return yangAlgorithms
}

func phase2KeyExchangeToYang(algorithms []string) []*ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_2KeyExchange {
	yangAlgorithms := []*ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_2KeyExchange{}
	for _, algorithm := range algorithms {
		yangAlgorithms = append(yangAlgorithms, &ipsecclient_yang.Ipsecclient_Api_Algorithm_Phase_2KeyExchange{Name: StringPointer(algorithm)})
	}
	return yangAlgorithms
}

func AlgorithmsToYang(algorithms Algorithm) *ipsecclient_yang.Ipsecclient_Api_Algorithm {
	return &ipsecclient_yang.Ipsecclient_Api_Algorithm{
		Phase_1Encryption:  phase1EncryptionToYang(algorithms.Phase1Encryption),
		Phase_1Integrity:   phase1IntegrityToYang(algorithms.Phase1Integrity),
		Phase_1KeyExchange: phase1KeyExchangeToYang(algorithms.Phase1KeyExchange),
		Phase_2Encryption:  phase2EncryptionToYang(algorithms.Phase2Encryption),
		Phase_2Integrity:   phase2IntegrityToYang(algorithms.Phase2Integrity),
		Phase_2KeyExchange: phase2KeyExchangeToYang(algorithms.Phase2KeyExchange),
	}
}
