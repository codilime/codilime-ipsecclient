package config

import (
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"
	"text/template"

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

type frrTemplateData struct {
	db.Vrf
	VlanList []db.Vlan
}

func (d frrTemplateData) HasOSPF() bool {
	if d.OSPF == nil {
		return false
	}
	return *d.OSPF
}

func (f *SoftwareGenerator) generateFRRConfig(vrf db.Vrf) error {
	bytes, err := ioutil.ReadFile(templatesFolder + "frr.template")
	if err != nil {
		return logger.ReturnError(err)
	}
	t, err := template.New("frr").Parse(string(bytes))
	if err != nil {
		return logger.ReturnError(err)
	}
	builder := strings.Builder{}
	vlanList, err := vrf.GetVlans()
	if err != nil {
		return logger.ReturnError(err)
	}
	if err = t.Execute(&builder, frrTemplateData{
		Vrf:      vrf,
		VlanList: vlanList,
	}); err != nil {
		return logger.ReturnError(err)
	}
	template := builder.String()
	log.Debugf("generated frr template:\n%s", template)
	return logger.ReturnError(f.storeFRRConfig(template))
}

func (f *SoftwareGenerator) deleteFRRConfig(vrf db.Vrf) error {
	log.Debugf("deleting frr config")
	frrConfig := fmt.Sprintf("no router bgp %d vrf %s\n", vrf.LocalAs, "vrf-"+strconv.Itoa(int(vrf.ID)))
	return logger.ReturnError(f.storeFRRConfig(frrConfig))
}
