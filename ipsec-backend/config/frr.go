/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package config

import (
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"
	"text/template"

	"ipsec_backend/db"

	log "github.com/sirupsen/logrus"
)

func (f *SoftwareGenerator) storeFRRConfig(tmpFile string) error {
	f.log.Info("storeFRRConfig invoked")
	if err := f.FileHandler.WriteFile("/opt/frr/vtysh.conf", []byte(tmpFile), 0644); err != nil {
		return fmt.Errorf("write file: %w", err)
	}

	if err := f.Supervisor.ReloadVtysh(); err != nil {
		return fmt.Errorf("reload vtysh: %w", err)
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
	f.log.Info("generateFRRConfig invoked")
	bytes, err := ioutil.ReadFile(templatesFolder + "frr.template")
	if err != nil {
		return fmt.Errorf("read file: %w", err)
	}

	t, err := template.New("frr").Parse(string(bytes))
	if err != nil {
		return fmt.Errorf("parse bytes: %w", err)
	}

	builder := strings.Builder{}
	vlanList, err := vrf.GetVlans(f.log)
	if err != nil {
		return fmt.Errorf("get vlands: %w", err)
	}

	if err = t.Execute(&builder, frrTemplateData{
		Vrf:      vrf,
		VlanList: vlanList,
	}); err != nil {
		return fmt.Errorf("execute template: %w", err)
	}

	template := builder.String()
	log.Debugf("generated frr template:\n%s", template)

	err = f.storeFRRConfig(template)
	if err != nil {
		return fmt.Errorf("store frr config after generation: %w", err)
	}
	

	return nil
}

func (f *SoftwareGenerator) deleteFRRConfig(vrf db.Vrf) error {
	f.log.Info("deleteFRRConfig invoked")
	frrConfig := fmt.Sprintf("no router bgp %d vrf %s\n", vrf.LocalAs, "vrf-"+strconv.Itoa(int(vrf.ID)))
	f.log.Debug(frrConfig)
	err := f.storeFRRConfig(frrConfig)
	if err != nil {
		return fmt.Errorf("store frr config during deletion: %w", err)
	}
	return nil
}
