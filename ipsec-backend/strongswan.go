package main

import (
	"os/exec"
	"strings"

	"github.com/strongswan/govici/vici"
)

const socketPath = "/opt/ipsec/charon.vici"

func ReloadStrongSwan(vrf *VrfWithEndpoints) error {
	return exec.Command("/usr/sbin/swanctl", "-q").Run()
}

func UnloadStrongSwan(vrf *VrfWithEndpoints) error {
	return exec.Command("/usr/sbin/swanctl", "-q").Run()
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
