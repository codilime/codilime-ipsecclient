package main

import (
	"ipsec_backend/sico_yang"
	"strconv"
	"strings"

	"github.com/strongswan/govici/vici"
)

const socketPath = "/opt/ipsec/conf/charon.vici"

type monitoringEndpoint struct {
	localAddr  string
	remoteAddr string
	status     string
	ID         uint32
}

func endpointIDFromKey(key string) (int, error) {
	l := strings.Split(key, "_")
	return strconv.Atoi(l[len(l)-1])
}

func GetStrongswanState() (map[string]*monitoringEndpoint, error) {
	options := vici.WithSocketPath(socketPath)
	session, err := vici.NewSession(options)
	if err != nil {
		return nil, ReturnError(err)
	}
	defer session.Close()

	m := vici.NewMessage()
	err = m.Set("noblock", "yes")
	if err != nil {
		return nil, ReturnError(err)
	}
	ms, err := session.StreamedCommandRequest("list-conns", "list-conn", m)
	if err != nil {
		return nil, ReturnError(err)
	}
	endpoints := map[string]*monitoringEndpoint{}
	for _, m = range ms.Messages() {
		for _, key := range m.Keys() {
			id, err := endpointIDFromKey(key)
			if err != nil {
				return nil, ReturnError(err)
			}
			e := &monitoringEndpoint{
				status: "DOWN",
				ID:     uint32(id),
			}
			e.localAddr = m.Get(key).(*vici.Message).Get("local_addrs").([]string)[0]
			e.remoteAddr = m.Get(key).(*vici.Message).Get("remote_addrs").([]string)[0]
			endpoints[key] = e
		}
	}
	m = vici.NewMessage()
	err = m.Set("noblock", "yes")
	if err != nil {
		return nil, ReturnError(err)
	}
	ms, err = session.StreamedCommandRequest("list-sas", "list-sa", m)
	if err != nil {
		return nil, ReturnError(err)
	}
	for _, m = range ms.Messages() {
		for _, key := range m.Keys() {
			endpoints[key].status = m.Get(key).(*vici.Message).Get("state").(string)
		}
	}
	return endpoints, nil
}

func normalizeAddress(addr string) string {
	if addr == "%any" {
		return "0.0.0.0"
	}
	return addr
}

func GetStrongswanSingleState(n string) (*sico_yang.SicoIpsec_Api_Monitoring, error) {
	name := strings.Replace(n, "-", "_", 1)
	statuses, err := GetStrongswanState()
	if err != nil {
		return nil, ReturnError(err)
	}
	ret := sico_yang.SicoIpsec_Api_Monitoring{
		Endpoint: map[uint32]*sico_yang.SicoIpsec_Api_Monitoring_Endpoint{},
	}
	for k, v := range statuses {
		if strings.Contains(k, name) {
			ret.Endpoint[v.ID] = &sico_yang.SicoIpsec_Api_Monitoring_Endpoint{
				LocalIp: stringPointer(normalizeAddress(v.localAddr)),
				PeerIp:  stringPointer(normalizeAddress(v.remoteAddr)),
				Status:  stringPointer(normalizeStatus(v.status)),
				Id:      uint32Pointer(v.ID),
			}
		}
	}

	return &ret, nil
}
