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

type SoftwareGenerator struct {
	FileHandler FileHandlerInterface
	Supervisor  SupervisorInterface
}

func (f *SoftwareGenerator) GenerateConfigs(vrf db.Vrf, _ ...db.SwitchCreds) error {
	log.Infof("generating templates")
	if err := f.saveCerts(&vrf); err != nil {
		return logger.ReturnError(err)
	}

	prefix := calculatePrefix(vrf)

	if err := f.generateStrongswanConfig(vrf, prefix); err != nil {
		return logger.ReturnError(err)
	}

	if err := f.generateSupervisorConfig(vrf, prefix); err != nil {
		return logger.ReturnError(err)
	}

	if err := f.generateFRRConfig(vrf); err != nil {
		return logger.ReturnError(err)
	}

	if err := f.Supervisor.ReloadSupervisor(); err != nil {
		return logger.ReturnError(err)
	}

	if err := f.Supervisor.ReloadStrongswan(); err != nil {
		return logger.ReturnError(err)
	}
	log.Debugf("generated templates for vrf %+v", vrf)
	return nil
}

func (f *SoftwareGenerator) DeleteConfigs(vrf db.Vrf, _ ...db.SwitchCreds) error {
	log.Infof("deleting templates")
	prefix := calculatePrefix(vrf)
	if err := logger.ReturnError(
		f.FileHandler.RemoveAll(getSupervisorFileName(prefix)),
		f.FileHandler.RemoveAll(getStrongswanFileName(prefix)),
		f.deleteFRRConfig(vrf),
		f.Supervisor.ReloadStrongswan(),
		f.Supervisor.ReloadSupervisor(),
		f.deleteCerts(vrf),
	); err != nil {
		return logger.ReturnError(err)
	}
	log.Debugf("deleted templates for vrf %+v", vrf)
	return nil
}

func (f *SoftwareGenerator) saveCerts(v *db.Vrf) error {
	for _, e := range v.Endpoints {
		if e.Authentication.Type != "certs" {
			continue
		}
		filename := fmt.Sprintf("/opt/ipsec/x509/%s-%s.pem", v.ClientName, e.PeerIP)
		if err := f.FileHandler.WriteFile(filename, []byte(e.Authentication.RemoteCert), 0644); err != nil {
			return logger.ReturnError(err)
		}
		filename = fmt.Sprintf("/opt/ipsec/x509/%s-%s.pem", v.ClientName, e.LocalIP)
		if err := f.FileHandler.WriteFile(filename, []byte(e.Authentication.LocalCert), 0644); err != nil {
			return logger.ReturnError(err)
		}
		filename = fmt.Sprintf("/opt/ipsec/rsa/%s-%s.key.pem", v.ClientName, e.PeerIP)
		if err := f.FileHandler.WriteFile(filename, []byte(e.Authentication.PrivateKey), 0644); err != nil {
			return logger.ReturnError(err)
		}
	}
	return nil
}

func (f *SoftwareGenerator) deleteCerts(v db.Vrf) error {
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
				return logger.ReturnError(err)
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
	data, err := executeStrongswanTemplate(vrf)
	if err != nil {
		return logger.ReturnError(err)
	}
	return f.FileHandler.WriteFile(getStrongswanFileName(prefix), []byte(data), 0644)
}

func executeStrongswanTemplate(vrf db.Vrf) (string, error) {
	t, err := template.New(strongswanTemplateFile).
		ParseFiles(strongswanTemplatePath)
	if err != nil {
		return "", logger.ReturnError(err)
	}
	builder := strings.Builder{}
	crypto1, err := convertToString(vrf.CryptoPh1)
	if err != nil {
		return "", logger.ReturnError(err)
	}
	crypto2, err := convertToString(vrf.CryptoPh2)
	if err != nil {
		return "", logger.ReturnError(err)
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
		return "", logger.ReturnError(err)
	}
	return builder.String(), nil
}

func (f *SoftwareGenerator) generateSupervisorConfig(vrf db.Vrf, prefix string) error {
	data, err := executeSupervisorTemplate(vrf)
	if err != nil {
		return logger.ReturnError(err)
	}
	return f.FileHandler.WriteFile(getSupervisorFileName(prefix), []byte(data), 0644)
}

func executeSupervisorTemplate(vrf db.Vrf) (string, error) {
	t, err := template.New(supervisorTemplateFile).ParseFiles(supervisorTemplatePath)
	if err != nil {
		return "", logger.ReturnError(err)
	}

	localIps := make([]string, 0, len(vrf.Endpoints))
	peerIps := make([]string, 0, len(vrf.Endpoints))
	nats := make([]string, 0, len(vrf.Endpoints))
	ids := make([]string, 0, len(vrf.Endpoints))
	vlans, err := vrf.GetVlans()
	if err != nil {
		return "", logger.ReturnError(err)
	}
	vlansStr := ""
	for _, vlan := range vlans {
		if strings.TrimSpace(vlan.LanIP) == "" {
			return "", logger.ReturnNewError("vlan.LanIP was empty")
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
		return "", logger.ReturnError(err)
	}
	return builder.String(), nil

}

func convertToString(s datatypes.JSON) (string, error) {
	m, err := s.MarshalJSON()
	if err != nil {
		return "", logger.ReturnError(err)
	}
	var arr []string
	if err = json.Unmarshal(m, &arr); err != nil {
		return "", logger.ReturnError(err)
	}
	res := strings.Join(arr, "-")
	return strings.ReplaceAll(res, "--", "-"), nil
}
