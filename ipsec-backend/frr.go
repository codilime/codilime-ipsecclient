package main

import (
	"fmt"
	"io/ioutil"
	"strconv"

	log "github.com/sirupsen/logrus"
)

func runTmpVtyshFile(tmpFile string) error {
	if err := ioutil.WriteFile("/opt/frr/vtysh.conf", []byte(tmpFile), 0644); err != nil {
		return ReturnError(err)
	}
	if err := RestartSupervisorProcess(supervisorNetSocketPath, "reload_vtysh"); err != nil {
		return ReturnError(err)
	}
	return nil
}

func generateFRRTemplate(vrf Vrf) error {
	createTmpFile := fmt.Sprintf("router bgp %d vrf %s\n  no bgp ebgp-requires-policy\n", vrf.LocalAs, "vrf-"+strconv.Itoa(int(vrf.ID)))
	for _, endpoint := range vrf.Endpoints {
		createTmpFile += fmt.Sprintf("  neighbor %s remote-as external\n", endpoint.PeerIP)
	}
	createTmpFile +=
		`  address-family ipv4 unicast
    redistribute connected
  exit-address-family`
	log.Debugf("generating frr template:\n%s", createTmpFile)
	return ReturnError(runTmpVtyshFile(createTmpFile))
}

func deleteFRRTemplate(vrf Vrf) error {
	deleteTmpFile := fmt.Sprintf("no router bgp %d vrf %s\n", vrf.LocalAs, "vrf-"+strconv.Itoa(int(vrf.ID)))
	return ReturnError(runTmpVtyshFile(deleteTmpFile))
}
