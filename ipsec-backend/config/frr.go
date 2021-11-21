package config

import (
	"fmt"
	"strconv"

	"ipsec_backend/db"
	"ipsec_backend/logger"

	log "github.com/sirupsen/logrus"
)

func (f *SoftwareGenerator) storeFRRConfig(tmpFile string) error {
	if err := f.FileHandler.WriteFile("/opt/frr/vtysh.conf", []byte(tmpFile), 0644); err != nil {
		return logger.ReturnError(err)
	}
	if err := f.Supervisor.ReloadVtysh(); err != nil {
		return logger.ReturnError(err)
	}
	log.Debugf("frr config stored:\n%s", tmpFile)
	return nil
}

func (f *SoftwareGenerator) generateFRRConfig(vrf db.Vrf) error {
	log.Debugf("generating frr config")
	frrConfig := fmt.Sprintf("router bgp %d vrf %s\n  no bgp ebgp-requires-policy\n", vrf.LocalAs, "vrf-"+strconv.Itoa(int(vrf.ID)))
	for _, endpoint := range vrf.Endpoints {
		frrConfig += fmt.Sprintf("  neighbor %s remote-as external\n", endpoint.PeerIP)
	}
	frrConfig +=
		`  address-family ipv4 unicast
    redistribute connected
  exit-address-family`
	return logger.ReturnError(f.storeFRRConfig(frrConfig))
}

func (f *SoftwareGenerator) deleteFRRConfig(vrf db.Vrf) error {
	log.Debugf("deleting frr config")
	frrConfig := fmt.Sprintf("no router bgp %d vrf %s\n", vrf.LocalAs, "vrf-"+strconv.Itoa(int(vrf.ID)))
	return logger.ReturnError(f.storeFRRConfig(frrConfig))
}
