/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package config

import (
	"errors"
	"ipsec_backend/sico_yang"
	"strconv"
	"strings"

	"ipsec_backend/db"
	"ipsec_backend/logger"

	"github.com/strongswan/govici/vici"
)

const socketPath = "/opt/ipsec/conf/charon.vici"

type monitoringEndpoint struct {
	localAddr  string
	remoteAddr string
	status     string
	ID         uint32
}

func (f *SoftwareGenerator) GetMonitoring(clientName *string, _ ...db.SwitchCreds) (*sico_yang.SicoIpsec_Api_Monitoring, error) {
	if clientName == nil {
		return nil, logger.ReturnError(errors.New("wrong monitoring parameter"))
	}
	name := strings.Replace(*clientName, "-", "_", 1)
	statuses, err := getStrongswanState()
	if err != nil {
		return nil, logger.ReturnError(err)
	}
	ret := sico_yang.SicoIpsec_Api_Monitoring{
		Endpoint: map[uint32]*sico_yang.SicoIpsec_Api_Monitoring_Endpoint{},
	}
	for k, v := range statuses {
		if strings.Contains(k, name) {
			ret.Endpoint[v.ID] = &sico_yang.SicoIpsec_Api_Monitoring_Endpoint{
				LocalIp: db.StringPointer(normalizeLocalIP(v.localAddr, v.remoteAddr)),
				PeerIp:  db.StringPointer(v.remoteAddr),
				Status:  db.StringPointer(normalizeStatus(v.status)),
				Id:      db.Uint32Pointer(v.ID),
			}
		}
	}

	return &ret, nil
}

func endpointIDFromKey(key string) (int, error) {
	l := strings.Split(key, "_")
	return strconv.Atoi(l[len(l)-1])
}

func getStrongswanState() (map[string]*monitoringEndpoint, error) {
	options := vici.WithSocketPath(socketPath)
	session, err := vici.NewSession(options)
	if err != nil {
		return nil, logger.ReturnError(err)
	}
	defer session.Close()

	m := vici.NewMessage()
	err = m.Set("noblock", "yes")
	if err != nil {
		return nil, logger.ReturnError(err)
	}
	ms, err := session.StreamedCommandRequest("list-conns", "list-conn", m)
	if err != nil {
		return nil, logger.ReturnError(err)
	}
	endpoints := map[string]*monitoringEndpoint{}
	for _, m = range ms.Messages() {
		for _, key := range m.Keys() {
			id, err := endpointIDFromKey(key)
			if err != nil {
				return nil, logger.ReturnError(err)
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
		return nil, logger.ReturnError(err)
	}
	ms, err = session.StreamedCommandRequest("list-sas", "list-sa", m)
	if err != nil {
		return nil, logger.ReturnError(err)
	}
	for _, m = range ms.Messages() {
		for _, key := range m.Keys() {
			endpoints[key].status = m.Get(key).(*vici.Message).Get("state").(string)
		}
	}
	return endpoints, nil
}
