package main

import (
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"
	"text/template"

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

type frrTemplateData struct {
	Vrf
	VlanList []Vlan
}

func (d frrTemplateData) HasOSPF() bool {
	if d.OSPF == nil {
		return false
	}
	return *d.OSPF
}

func (f *FileGenerator) generateFRRConfig(vrf Vrf) error {
	bytes, err := ioutil.ReadFile(templatesFolder + "frr.template")
	if err != nil {
		return ReturnError(err)
	}
	t, err := template.New("frr").Parse(string(bytes))
	if err != nil {
		return ReturnError(err)
	}
	builder := strings.Builder{}
	vlanList, err := vrf.getVlans()
	if err != nil {
		return ReturnError(err)
	}
	if err = t.Execute(&builder, frrTemplateData{
		Vrf:      vrf,
		VlanList: vlanList,
	}); err != nil {
		return ReturnError(err)
	}
	template := builder.String()
	log.Debugf("generated frr template:\n%s", template)
	return ReturnError(f.storeFRRConfig(template))
}

func (f *FileGenerator) deleteFRRConfig(vrf Vrf) error {
	log.Debugf("deleting frr config")
	frrConfig := fmt.Sprintf("no router bgp %d vrf %s\n", vrf.LocalAs, "vrf-"+strconv.Itoa(int(vrf.ID)))
	return ReturnError(f.storeFRRConfig(frrConfig))
}
