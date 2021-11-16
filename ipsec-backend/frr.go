package main

import (
	"fmt"
	"strconv"

	log "github.com/sirupsen/logrus"
)

func (f *FileGenerator) storeFRRConfig(tmpFile string) error {
	if err := f.fileHandler.WriteFile("/opt/frr/vtysh.conf", []byte(tmpFile), 0644); err != nil {
		return ReturnError(err)
	}
	if err := f.supervisor.ReloadVtysh(); err != nil {
		return ReturnError(err)
	}
	log.Debugf("frr config stored:\n%s", tmpFile)
	return nil
}

func (f *FileGenerator) generateFRRConfig(vrf Vrf) error {
	log.Debugf("generating frr config")
	frrConfig := fmt.Sprintf("router bgp %d vrf %s\n  no bgp ebgp-requires-policy\n", vrf.LocalAs, "vrf-"+strconv.Itoa(int(vrf.ID)))
	for _, endpoint := range vrf.Endpoints {
		frrConfig += fmt.Sprintf("  neighbor %s remote-as external\n", endpoint.PeerIP)
	}
	frrConfig +=
		`  address-family ipv4 unicast
    redistribute connected
  exit-address-family`
	return ReturnError(f.storeFRRConfig(frrConfig))
}

func (f *FileGenerator) deleteFRRConfig(vrf Vrf) error {
	log.Debugf("deleting frr config")
	frrConfig := fmt.Sprintf("no router bgp %d vrf %s\n", vrf.LocalAs, "vrf-"+strconv.Itoa(int(vrf.ID)))
	return ReturnError(f.storeFRRConfig(frrConfig))
}
