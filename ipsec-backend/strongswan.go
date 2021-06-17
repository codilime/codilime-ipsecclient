package main

import (
	"fmt"
	"strconv"
	"strings"

	log "github.com/sirupsen/logrus"
	"github.com/strongswan/govici/vici"
)

const socketPath = "/opt/ipsec/charon.vici"

type connection struct {
	Name          string
	RemoteAddress []string            `vici:"remote_addrs"`
	Local         *localOpts          `vici:"local"`
	Remote        *remoteOpts         `vici:"remote"`
	Children      map[string]*childSA `vici:"children"`
	Version       int                 `vici:"version"`
	Proposals     []string            `vici:"proposals"`
}

type localOpts struct {
	Auth  string   `vici:"auth"`
	Certs []string `vici:"certs"`
	ID    string   `vici:"id"`
}

type remoteOpts struct {
	Auth string `vici:"auth"`
	ID   string `vici:"id"`
}

type childSA struct {
	RemoteTrafficSelectors []string `vici:"remote_ts"`
	LocalTrafficSelectors  []string `vici:"local_ts"`
	IfIdIn                 int      `vici:"if_id_in"`
	IfIdOut                int      `vici:"if_id_out"`
	ESPProposals           []string `vici:"esp_proposals"`
	StartAction            string   `vici:"start_action"`
}

type secret struct {
	ID   string `vici:"id"`
	Type string `vici:"type"`
	Data string `vici:"data"`
}

func ReloadStrongSwan(vrf *VrfWithEndpoints) error {
	options := vici.WithSocketPath(socketPath)
	session, err := vici.NewSession(options)
	if err != nil {
		return err
	}

	defer func() {
		if err := session.Close(); err != nil {
			log.Errorf("Error during closing strongswan connection %v", err)
		}
	}()

	for i := range vrf.Endpoints {
		sec := createSecret(vrf, i)
		if err := loadSecret(session, sec); err != nil {
			return err
		}
	}

	for i := range vrf.Endpoints {
		conn, err := createConnection(vrf, i)
		if err != nil {
			return err
		}
		if err := loadConnections(session, conn); err != nil {
			return err
		}
	}

	return nil
}

func UnloadStrongSwan(vrf *VrfWithEndpoints) error {
	options := vici.WithSocketPath(socketPath)
	session, err := vici.NewSession(options)
	if err != nil {
		return err
	}

	defer func() {
		if err := session.Close(); err != nil {
			log.Errorf("Error during closing strongswan connection %v", err)
		}
	}()

	for i := range vrf.Endpoints {
		name := vrf.Endpoints[i].RemoteIPSec
		if err := unloadSecret(session, name); err != nil {
			return err
		}
	}
	for i := range vrf.Endpoints {
		name := fmt.Sprintf("%d_%s_%d", vrf.Vlan, vrf.ClientName, i+1)
		if err := unloadConnection(session, name); err != nil {
			return err
		}
	}
	return nil
}

func createConnection(vrf *VrfWithEndpoints, index int) (connection, error) {
	name := fmt.Sprintf("%d_%s_%d", vrf.Vlan, vrf.ClientName, index+1)
	cryptoPh1, err := convertToString(vrf.CryptoPh1)
	if err != nil {
		return connection{}, err
	}
	cryptoPh2, err := convertToString(vrf.CryptoPh2)
	if err != nil {
		return connection{}, err
	}
	return connection{
		Name:          name,
		RemoteAddress: []string{vrf.Endpoints[index].RemoteIPSec},
		Local: &localOpts{
			Auth: "psk",
			ID:   vrf.Endpoints[index].RemoteIPSec,
		},
		Remote: &remoteOpts{
			Auth: "psk",
			ID:   vrf.Endpoints[index].RemoteIPSec,
		},
		Children: map[string]*childSA{
			"site-cisco_" + strconv.Itoa(index+1): {
				RemoteTrafficSelectors: []string{"0.0.0.0/0"},
				LocalTrafficSelectors:  []string{"0.0.0.0/0"},
				IfIdIn:                 calculateIndex(vrf.Vlan, index+1),
				IfIdOut:                calculateIndex(vrf.Vlan, index+1),
				ESPProposals:           []string{cryptoPh2},
				StartAction:            "start",
			},
		},
		Version:   2,
		Proposals: []string{cryptoPh1},
	}, nil
}

func loadConnections(s *vici.Session, conn connection) error {
	c, err := vici.MarshalMessage(&conn)
	if err != nil {
		return err
	}

	m := vici.NewMessage()
	if err := m.Set(conn.Name, c); err != nil {
		return err
	}

	_, err = s.CommandRequest("load-conn", m)

	return err
}

func createSecret(vrf *VrfWithEndpoints, index int) secret {
	return secret{
		ID:   vrf.Endpoints[index].RemoteIPSec,
		Type: "ike",
		Data: vrf.Endpoints[index].PSK,
	}
}

func loadSecret(s *vici.Session, sec secret) error {
	m, err := vici.MarshalMessage(&sec)
	if err != nil {
		return err
	}

	_, err = s.CommandRequest("load-shared", m)

	return err
}

func unloadConnection(s *vici.Session, name string) error {
	m := vici.NewMessage()
	if err := m.Set("name", name); err != nil {
		return err
	}

	_, err := s.CommandRequest("unload-conn", m)

	return err
}

func unloadSecret(s *vici.Session, name string) error {
	m := vici.NewMessage()
	if err := m.Set("id", name); err != nil {
		return err
	}

	_, err := s.CommandRequest("unload-shared", m)

	return err
}

func GetStrongswanState() (map[string]string, error) {
	options := vici.WithSocketPath(socketPath)
	session, err := vici.NewSession(options)
	if err != nil {
		return nil, err
	}
	defer session.Close()

	statuses := map[string]string{}
	m, err := session.CommandRequest("get-conns", nil)
	if err != nil {
		return nil, err
	}
	for _, key := range m.Get("conns").([]string) {
		statuses[key] = "DOWN"
	}

	m = vici.NewMessage()
	m.Set("noblock", "yes")
	ms, err := session.StreamedCommandRequest("list-sas", "list-sa", m)
	if err != nil {
		return nil, err
	}
	for _, m = range ms.Messages() {
		for _, key := range m.Keys() {
			statuses[key] = m.Get(key).(*vici.Message).Get("state").(string)
		}
	}

	return statuses, nil
}

func GetStrongswanSingleState(n string) (map[string]string, error) {
	name := strings.Replace(n, "-", "_", 1)
	statuses, err := GetStrongswanState()
	if err != nil {
		return nil, err
	}

	res := map[string]string{}
	for k, v := range statuses {
		if strings.Contains(k, name) {
			res[k] = v
		}
	}

	return res, nil
}
