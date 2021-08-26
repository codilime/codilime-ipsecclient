package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
)

func runTmpVtyshFile(tmpFile string) error {
	if err := ioutil.WriteFile("/opt/frr/vtysh.conf", []byte(tmpFile), 0644); err != nil {
		return err
	}
	if err := RestartSupervisorProcess("reload_vtysh"); err != nil {
		return err
	}
	return nil
}

func generateFRRTemplate(vrf Vrf) error {
	endpoints := make([]endpoint, 0)
	if err := json.Unmarshal([]byte(vrf.Endpoints.String()), &endpoints); err != nil {
		return err
	}
	createTmpFile := fmt.Sprintf("router bgp %d vrf %s\n  no bgp ebgp-requires-policy", vrf.LocalAs, vrf.ClientName)
	for _, endpoint := range endpoints {
		createTmpFile += fmt.Sprintf("  neighbor %s remote-as external\n", endpoint.PeerIP)
	}
	return runTmpVtyshFile(createTmpFile)
}

func deleteFRRTemplate(vrf Vrf) error {
	deleteTmpFile := fmt.Sprintf("no router bgp %d vrf %s\n", vrf.LocalAs, vrf.ClientName)
	return runTmpVtyshFile(deleteTmpFile)
}
