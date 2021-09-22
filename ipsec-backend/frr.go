package main

import (
	"fmt"
	"io/ioutil"
	"strconv"
)

func runTmpVtyshFile(tmpFile string) error {
	if err := ioutil.WriteFile("/opt/frr/vtysh.conf", []byte(tmpFile), 0644); err != nil {
		return ReturnError(err)
	}
	if err := RestartSupervisorProcess("reload_vtysh"); err != nil {
		return ReturnError(err)
	}
	return nil
}

func generateFRRTemplate(vrf Vrf) error {
	createTmpFile := fmt.Sprintf("router bgp %d vrf %s\n  no bgp ebgp-requires-policy\n", vrf.LocalAs, "vrf-"+strconv.Itoa(vrf.Vlan))
	for _, endpoint := range vrf.Endpoints {
		createTmpFile += fmt.Sprintf("  neighbor %s remote-as external\n", endpoint.PeerIP)
	}
	fmt.Println("generating frr template:")
	fmt.Println(createTmpFile)
	return ReturnError(runTmpVtyshFile(createTmpFile))
}

func deleteFRRTemplate(vrf Vrf) error {
	deleteTmpFile := fmt.Sprintf("no router bgp %d vrf %s\n", vrf.LocalAs, "vrf-"+strconv.Itoa(vrf.Vlan))
	return ReturnError(runTmpVtyshFile(deleteTmpFile))
}
