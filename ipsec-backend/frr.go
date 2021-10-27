package main

import (
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"
	"text/template"

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
	bytes, err := ioutil.ReadFile(templatesFolder + "frr.template")
	if err != nil {
		return ReturnError(err)
	}
	t, err := template.New("frr").Parse(string(bytes))
	if err != nil {
		return ReturnError(err)
	}
	builder := strings.Builder{}
	if err = t.Execute(&builder, vrf); err != nil {
		return ReturnError(err)
	}
	template := builder.String()
	log.Debugf("generated frr template:\n%s", template)
	return ReturnError(runTmpVtyshFile(template))
}

func deleteFRRTemplate(vrf Vrf) error {
	deleteTmpFile := fmt.Sprintf("no router bgp %d vrf %s\n", vrf.LocalAs, "vrf-"+strconv.Itoa(int(vrf.ID)))
	return ReturnError(runTmpVtyshFile(deleteTmpFile))
}
