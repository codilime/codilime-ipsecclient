/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package config

import (
	"errors"
	"fmt"
	"ipsec_backend/ipsecclient_yang"
	"strconv"
	"strings"

	"ipsec_backend/db"

	log "github.com/sirupsen/logrus"
	"github.com/strongswan/govici/vici"
)

const socketPath = "/opt/ipsec/conf/charon.vici"

type monitoringEndpoint struct {
	localAddr  string
	remoteAddr string
	status     string
	ID         uint32
}

func (f *SoftwareGenerator) GetMonitoring(clientName *string) (*ipsecclient_yang.Ipsecclient_Api_Monitoring, error) {
	log.Info("GetMonitoring invoked")
	log.Debug(clientName)

	if clientName == nil {
		return nil, errors.New("wrong monitoring parameter")
	}

	name := strings.Replace(*clientName, "-", "_", 1)
	statuses, err := getStrongswanState()
	if err != nil {
		return nil, fmt.Errorf("get strongswan state %w:", err)
	}

	ret := ipsecclient_yang.Ipsecclient_Api_Monitoring{
		Endpoint: map[uint32]*ipsecclient_yang.Ipsecclient_Api_Monitoring_Endpoint{},
	}

	for k, v := range statuses {
		if strings.Contains(k, name) {
			ret.Endpoint[v.ID] = &ipsecclient_yang.Ipsecclient_Api_Monitoring_Endpoint{
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
	log.Info("getStrongswanState invoked")

	options := vici.WithSocketPath(socketPath)
	session, err := vici.NewSession(options)
	if err != nil {
		return nil, fmt.Errorf("creating new vici session: %w", err)
	}
	defer session.Close()

	m := vici.NewMessage()
	err = m.Set("noblock", "yes")
	if err != nil {
		return nil, fmt.Errorf("setting noblock vici message: %w", err)
	}

	ms, err := session.StreamedCommandRequest("list-conns", "list-conn", m)
	if err != nil {
		return nil, fmt.Errorf("listing connections: %w", err)
	}

	endpoints := map[string]*monitoringEndpoint{}
	for _, m = range ms.Messages() {
		for _, key := range m.Keys() {
			id, err := endpointIDFromKey(key)
			if err != nil {
				return nil, fmt.Errorf("getting endpoint ID from key %s: %w", key, err)
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
		return nil, fmt.Errorf("setting noblock vici message 2: %w", err)
	}

	ms, err = session.StreamedCommandRequest("list-sas", "list-sa", m)
	if err != nil {
		return nil, fmt.Errorf("listing sas: %w", err)
	}

	for _, m = range ms.Messages() {
		for _, key := range m.Keys() {
			endpoints[key].status = m.Get(key).(*vici.Message).Get("state").(string)
		}
	}

	return endpoints, nil
}
