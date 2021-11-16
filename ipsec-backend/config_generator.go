package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"text/template"

	"github.com/davecgh/go-spew/spew"
	log "github.com/sirupsen/logrus"
	"gorm.io/datatypes"
)

const (
	templatesFolder        = "templates/"
	strongswanTemplateFile = "strongswan.conf.template"
	strongswanTemplatePath = templatesFolder + strongswanTemplateFile
	supervisorTemplateFile = "supervisor.ini.template"
	supervisorTemplatePath = templatesFolder + supervisorTemplateFile
)

func (e *Endpoint) IsPSK() string {
	if e.Authentication.Type == "psk" {
		return "psk"
	}
	return ""
}

func (e *Endpoint) IsCerts() string {
	if e.Authentication.Type == "certs" {
		return "certs"
	}
	return ""
}

type FileGenerator struct {
	fileHandler FileHandlerInterface
	supervisor  SupervisorInterface
}

func (f *FileGenerator) GenerateConfigs(vrf Vrf) error {
	log.Infof("generating templates")
	if err := f.saveCerts(&vrf); err != nil {
		return ReturnError(err)
	}

	prefix := calculatePrefix(vrf)

	if err := f.generateStrongswanConfig(vrf, prefix); err != nil {
		return ReturnError(err)
	}

	if err := f.generateSupervisorConfig(vrf, prefix); err != nil {
		return ReturnError(err)
	}

	if err := f.generateFRRConfig(vrf); err != nil {
		return ReturnError(err)
	}

	if err := f.supervisor.ReloadSupervisor(); err != nil {
		return ReturnError(err)
	}

	if err := f.supervisor.ReloadStrongswan(); err != nil {
		return ReturnError(err)
	}
	log.Debugf("generated templates for vrf %+v", vrf)
	return nil
}

func (f *FileGenerator) DeleteConfigs(vrf Vrf) error {
	log.Infof("deleting templates")
	prefix := calculatePrefix(vrf)
	if err := ReturnError(
		f.fileHandler.RemoveAll(getSupervisorFileName(prefix)),
		f.fileHandler.RemoveAll(getStrongswanFileName(prefix)),
		f.deleteFRRConfig(vrf),
		f.supervisor.ReloadStrongswan(),
		f.supervisor.ReloadSupervisor(),
		f.deleteCerts(vrf),
	); err != nil {
		return ReturnError(err)
	}
	log.Debugf("deleted templates for vrf %+v", vrf)
	return nil
}

func (f *FileGenerator) saveCerts(v *Vrf) error {
	for _, e := range v.Endpoints {
		if e.Authentication.Type != "certs" {
			continue
		}
		filename := fmt.Sprintf("/opt/ipsec/x509/%s-%s.pem", v.ClientName, e.PeerIP)
		if err := f.fileHandler.WriteFile(filename, []byte(e.Authentication.RemoteCert), 0644); err != nil {
			return ReturnError(err)
		}
		filename = fmt.Sprintf("/opt/ipsec/x509/%s-%s.pem", v.ClientName, e.LocalIP)
		if err := f.fileHandler.WriteFile(filename, []byte(e.Authentication.LocalCert), 0644); err != nil {
			return ReturnError(err)
		}
		filename = fmt.Sprintf("/opt/ipsec/rsa/%s-%s.key.pem", v.ClientName, e.PeerIP)
		if err := f.fileHandler.WriteFile(filename, []byte(e.Authentication.PrivateKey), 0644); err != nil {
			return ReturnError(err)
		}
	}
	return nil
}

func (f *FileGenerator) deleteCerts(v Vrf) error {
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
			if err := f.fileHandler.Remove(file); err != nil {
				return ReturnError(err)
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

func calculatePrefix(vrf Vrf) string {
	return fmt.Sprintf("vrf%d", vrf.ID)
}

func (f *FileGenerator) generateStrongswanConfig(vrf Vrf, prefix string) error {
	data, err := executeStrongswanTemplate(vrf)
	if err != nil {
		return ReturnError(err)
	}
	return f.fileHandler.WriteFile(getStrongswanFileName(prefix), []byte(data), 0644)
}

func executeStrongswanTemplate(vrf Vrf) (string, error) {
	t, err := template.New(strongswanTemplateFile).
		ParseFiles(strongswanTemplatePath)
	if err != nil {
		return "", ReturnError(err)
	}
	builder := strings.Builder{}
	crypto1, err := convertToString(vrf.CryptoPh1)
	if err != nil {
		return "", ReturnError(err)
	}
	crypto2, err := convertToString(vrf.CryptoPh2)
	if err != nil {
		return "", ReturnError(err)
	}
	log.Debugf("generating for:\n%+v", spew.Sdump(vrf))
	if err = t.Execute(&builder, struct {
		Vrf
		Crypto1 string
		Crypto2 string
	}{
		vrf,
		crypto1,
		crypto2,
	}); err != nil {
		return "", ReturnError(err)
	}
	return builder.String(), nil
}

func (f *FileGenerator) generateSupervisorConfig(vrf Vrf, prefix string) error {
	data, err := executeSupervisorTemplate(vrf)
	if err != nil {
		return ReturnError(err)
	}
	return f.fileHandler.WriteFile(getSupervisorFileName(prefix), []byte(data), 0644)
}

func executeSupervisorTemplate(vrf Vrf) (string, error) {
	t, err := template.New(supervisorTemplateFile).ParseFiles(supervisorTemplatePath)
	if err != nil {
		return "", ReturnError(err)
	}

	localIps := make([]string, 0, len(vrf.Endpoints))
	peerIps := make([]string, 0, len(vrf.Endpoints))
	nats := make([]string, 0, len(vrf.Endpoints))
	ids := make([]string, 0, len(vrf.Endpoints))
	vlans, err := vrf.getVlans()
	if err != nil {
		return "", ReturnError(err)
	}
	vlansStr := ""
	for _, vlan := range vlans {
		if strings.TrimSpace(vlan.LanIP) == "" {
			return "", ReturnNewError("vlan.LanIP was empty")
		}
		vlansStr += fmt.Sprintf("%d %s ", vlan.Vlan, vlan.LanIP)
	}
	for _, endpoint := range vrf.Endpoints {
		localIps = append(localIps, endpoint.LocalIP)
		peerIps = append(peerIps, endpoint.PeerIP)
		ids = append(ids, strconv.Itoa(int(endpoint.ID)))
		if endpoint.NAT {
			nats = append(nats, "YES")
		} else {
			nats = append(nats, "NO")
		}
	}

	builder := strings.Builder{}
	if err = t.Execute(&builder, struct {
		Vrf
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
		return "", ReturnError(err)
	}
	return builder.String(), nil

}

func convertToString(s datatypes.JSON) (string, error) {
	m, err := s.MarshalJSON()
	if err != nil {
		return "", ReturnError(err)
	}
	var arr []string
	if err = json.Unmarshal(m, &arr); err != nil {
		return "", ReturnError(err)
	}
	res := strings.Join(arr, "-")
	return strings.ReplaceAll(res, "--", "-"), nil
}
