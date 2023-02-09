/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package config

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"text/template"

	"ipsec_backend/db"
	"ipsec_backend/logger"

	"github.com/davecgh/go-spew/spew"
	"github.com/sirupsen/logrus"
	"gorm.io/datatypes"
)

const (
	templatesFolder        = "templates/"
	strongswanTemplateFile = "strongswan.conf.template"
	strongswanTemplatePath = templatesFolder + strongswanTemplateFile
	supervisorTemplateFile = "supervisor.ini.template"
	supervisorTemplatePath = templatesFolder + supervisorTemplateFile
)

type SoftwareGenerator struct {
	FileHandler FileHandlerInterface
	Supervisor  SupervisorInterface
	log *logrus.Logger
}

func NewSoftwareGenerator(FileHandler FileHandlerInterface, Supervisor SupervisorInterface, log *logrus.Logger) (*SoftwareGenerator, error) {
	log.Info("NewSoftwareGenerator invoked")
	if err := FileHandler.WriteFile("/opt/frr/vtysh.conf", []byte(""), 0644); err != nil {
		return nil, err
	}

	return &SoftwareGenerator{FileHandler, Supervisor, log}, nil
}

func vrfShouldDoFRR(vrf db.Vrf) bool {
	if *vrf.OSPF {
		return true
	}
	for _, e := range vrf.Endpoints {
		if e.BGP {
			return true
		}
	}

	return false
}

func (f *SoftwareGenerator) GenerateConfigs(vrf db.Vrf) error {
	f.log.Info("GenerateConfigs invoked")

	if err := f.saveCerts(&vrf); err != nil {
		return logger.ReturnError(f.log, err)
	}

	prefix := calculatePrefix(vrf)

	if err := f.generateStrongswanConfig(vrf, prefix); err != nil {
		return logger.ReturnError(f.log, err)
	}

	if err := f.generateSupervisorConfig(vrf, prefix, f.log); err != nil {
		return logger.ReturnError(f.log, err)
	}

	if vrfShouldDoFRR(vrf) {
		if err := f.generateFRRConfig(vrf); err != nil {
			return logger.ReturnError(f.log, err)
		}
	}

	if err := f.Supervisor.ReloadSupervisor(); err != nil {
		return logger.ReturnError(f.log, err)
	}

	if err := f.Supervisor.ReloadStrongswan(); err != nil {
		return logger.ReturnError(f.log, err)
	}

	f.log.Debugf("generated templates for vrf %+v", vrf)

	return nil
}

func (f *SoftwareGenerator) DeleteConfigs(vrf db.Vrf) error {
	f.log.Infof("deleting templates")
	prefix := calculatePrefix(vrf)

	err := f.FileHandler.RemoveAll(getSupervisorFileName(prefix))
	if err != nil {
		logger.ReturnError(f.log, err)
	}

	err = f.FileHandler.RemoveAll(getStrongswanFileName(prefix))
	if err != nil {
		logger.ReturnError(f.log, err)
	}

	err = f.deleteFRRConfig(vrf)
	if err != nil {
		logger.ReturnError(f.log, err)
	}

	err = f.Supervisor.ReloadStrongswan()
	if err != nil {
		logger.ReturnError(f.log, err)
	}

	err = f.Supervisor.ReloadSupervisor()
	if err != nil {
		logger.ReturnError(f.log, err)
	}

	err = f.deleteCerts(vrf)
	if err != nil {
		logger.ReturnError(f.log, err)
	}

	f.log.Debugf("deleted templates for vrf %+v", vrf)
	return nil
}

func (f *SoftwareGenerator) saveCerts(v *db.Vrf) error {
	f.log.Info("saveCerts invoked")
	f.log.Debug(v)

	for _, e := range v.Endpoints {
		if e.Authentication.Type != "certs" {
			continue
		}
		filename := fmt.Sprintf("/opt/ipsec/x509/%s-%s.pem", v.ClientName, e.PeerIP)
		if err := f.FileHandler.WriteFile(filename, []byte(e.Authentication.RemoteCert), 0644); err != nil {
			return logger.ReturnError(f.log, err)
		}
		filename = fmt.Sprintf("/opt/ipsec/x509/%s-%s.pem", v.ClientName, e.LocalIP)
		if err := f.FileHandler.WriteFile(filename, []byte(e.Authentication.LocalCert), 0644); err != nil {
			return logger.ReturnError(f.log, err)
		}
		filename = fmt.Sprintf("/opt/ipsec/rsa/%s-%s.key.pem", v.ClientName, e.PeerIP)
		if err := f.FileHandler.WriteFile(filename, []byte(e.Authentication.PrivateKey), 0644); err != nil {
			return logger.ReturnError(f.log, err)
		}
	}

	return nil
}

func (f *SoftwareGenerator) deleteCerts(v db.Vrf) error {
	f.log.Info("deleteCerts invoked")
	f.log.Debug(v)

	for _, e := range v.Endpoints {
		if e.Authentication.Type != "certs" {
			continue
		}
		filenames := []string{
			fmt.Sprintf("/opt/ipsec/x509/%s-%s.pem", v.ClientName, e.PeerIP),
			fmt.Sprintf("/opt/ipsec/x509/%s-%s.pem", v.ClientName, e.LocalIP),
			fmt.Sprintf("/opt/ipsec/rsa/%s-%s.key.pem", v.ClientName, e.PeerIP),
		}
		for _, file := range filenames {
			if err := f.FileHandler.Remove(file); err != nil {
				return logger.ReturnError(f.log, err)
			}
		}
	}

	return nil
}

func getStrongswanFileName(prefix string) string {
	return "/opt/ipsec/conf/" + prefix + ".conf"
}

func getSupervisorFileName(prefix string) string {
	return "/opt/super_net/" + prefix + ".ini"
}

func calculatePrefix(vrf db.Vrf) string {
	return fmt.Sprintf("vrf%d", vrf.ID)
}

func (f *SoftwareGenerator) generateStrongswanConfig(vrf db.Vrf, prefix string) error {
	f.log.Info("generateStrongswanConfig invoked")
	f.log.Debug(vrf, prefix)

	data, err := executeStrongswanTemplate(vrf, f.log)
	if err != nil {
		return logger.ReturnError(f.log, err)
	}

	return f.FileHandler.WriteFile(getStrongswanFileName(prefix), []byte(data), 0644)
}

func executeStrongswanTemplate(vrf db.Vrf, log *logrus.Logger) (string, error) {
	log.Info("executeStrongswanTemplate invoked")

	t, err := template.New(strongswanTemplateFile).
		ParseFiles(strongswanTemplatePath)
	if err != nil {
		return "", logger.ReturnError(log, err)
	}

	builder := strings.Builder{}
	crypto1, err := convertToString(vrf.CryptoPh1, log)
	if err != nil {
		return "", logger.ReturnError(log, err)
	}

	crypto2, err := convertToString(vrf.CryptoPh2, log)
	if err != nil {
		return "", logger.ReturnError(log, err)
	}

	log.Debugf("generating for:\n%+v", spew.Sdump(vrf))

	if err = t.Execute(&builder, struct {
		db.Vrf
		Crypto1 string
		Crypto2 string
	}{
		vrf,
		crypto1,
		crypto2,
	}); err != nil {
		return "", logger.ReturnError(log, err)
	}

	return builder.String(), nil
}

func (f *SoftwareGenerator) generateSupervisorConfig(vrf db.Vrf, prefix string, log *logrus.Logger) error {
	f.log.Info("generateSupervisorConfig invoked")
	f.log.Debug(vrf, prefix)

	data, err := executeSupervisorTemplate(vrf, log)
	if err != nil {
		return logger.ReturnError(log, err)
	}

	return f.FileHandler.WriteFile(getSupervisorFileName(prefix), []byte(data), 0644)
}

func executeSupervisorTemplate(vrf db.Vrf, log *logrus.Logger) (string, error) {
	log.Info("executeSupervisorTemplate invoked")

	t, err := template.New(supervisorTemplateFile).ParseFiles(supervisorTemplatePath)
	if err != nil {
		return "", logger.ReturnError(log, err)
	}

	localIps := make([]string, 0, len(vrf.Endpoints))
	peerIps := make([]string, 0, len(vrf.Endpoints))
	nats := make([]string, 0, len(vrf.Endpoints))
	ids := make([]string, 0, len(vrf.Endpoints))
	vlans, err := vrf.GetVlans(log)
	if err != nil {
		return "", logger.ReturnError(log, err)
	}

	vlansStr := ""
	for _, vlan := range vlans {
		if strings.TrimSpace(vlan.LanIP) == "" {
			return "", logger.ReturnNewError("vlan.LanIP was empty", log)
		}
		vlansStr += fmt.Sprintf("%d %s ", vlan.Vlan, vlan.LanIP)
	}

	for _, endpoint := range vrf.Endpoints {
		localIps = append(localIps, endpoint.LocalIP)
		if endpoint.PeerIP == "" {
			peerIps = append(peerIps, "empty")
		} else {
			peerIps = append(peerIps, endpoint.PeerIP)
		}
		ids = append(ids, strconv.Itoa(int(endpoint.ID)))
		if endpoint.NAT {
			nats = append(nats, "YES")
		} else {
			nats = append(nats, "NO")
		}
	}

	builder := strings.Builder{}
	if err = t.Execute(&builder, struct {
		db.Vrf
		LocalIPs    string
		PeerIPs     string
		LanIPs      string
		Nats        string
		EndpointIDs string
		Vlans       string
	}{
		Vrf:         vrf,
		LocalIPs:    strings.Join(localIps, " "),
		PeerIPs:     strings.Join(peerIps, " "),
		Nats:        strings.Join(nats, " "),
		EndpointIDs: strings.Join(ids, " "),
		Vlans:       vlansStr,
	}); err != nil {
		return "", logger.ReturnError(log, err)
	}

	return builder.String(), nil

}

func convertToString(s datatypes.JSON, log *logrus.Logger) (string, error) {
	log.Info("convertToString invoked")

	m, err := s.MarshalJSON()
	if err != nil {
		return "", logger.ReturnError(log, err)
	}
	var arr []string
	if err = json.Unmarshal(m, &arr); err != nil {
		return "", logger.ReturnError(log, err)
	}
	res := strings.Join(arr, "-")
	
	return strings.ReplaceAll(res, "--", "-"), nil
}
