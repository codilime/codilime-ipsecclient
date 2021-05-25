package main

import (
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/strongswan/govici/vici"
)

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
	options := vici.WithSocketPath("/opt/ipsec/charon.vici")
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
		conn := createConnection(vrf, i)
		if err := loadConnections(session, conn); err != nil {
			return err
		}

		sec := createSecret(vrf, i)
		if err := loadSecret(session, sec); err != nil {
			return err
		}
	}

	return nil
}

func UnloadStrongSwan(vrf *VrfWithEndpoints) error {
	options := vici.WithSocketPath("/opt/ipsec/charon.vici")
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
		name := fmt.Sprintf("%d_%s_%d", vrf.Vlan, vrf.ClientName, i+1)
		if err := unloadSecret(session, name); err != nil {
			return err
		}
		if err := unloadConnection(session, name); err != nil {
			return err
		}
	}
	return nil
}

func createConnection(vrf *VrfWithEndpoints, index int) connection {
	name := fmt.Sprintf("%d_%s_%d", vrf.Vlan, vrf.ClientName, index+1)
	return connection{
		Name:          name,
		RemoteAddress: []string{vrf.Endpoints[index].RemoteIPSec},
		Local: &localOpts{
			Auth: "psk",
			ID:   "ike_" + name,
		},
		Remote: &remoteOpts{
			Auth: "psk",
		},
		Children: map[string]*childSA{
			"site-cisco": {
				RemoteTrafficSelectors: []string{"0.0.0.0/0"},
				LocalTrafficSelectors:  []string{"0.0.0.0/0"},
				IfIdIn:                 calculateIndex(vrf.Vlan, index+1),
				IfIdOut:                calculateIndex(vrf.Vlan, index+1),
				ESPProposals:           []string{vrf.CryptoPh2},
				StartAction:            "start",
			},
		},
		Version:   2,
		Proposals: []string{vrf.CryptoPh1},
	}
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
	name := fmt.Sprintf("ike_%d_%s_%d", vrf.Vlan, vrf.ClientName, index+1)
	return secret{
		ID:   name,
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
	if err := m.Set("id", "ike_"+name); err != nil {
		return err
	}

	_, err := s.CommandRequest("unload-shared", m)

	return err
}
