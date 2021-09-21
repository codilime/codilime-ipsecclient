package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
	"text/template"

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

type EndpointAuth struct {
	Type       string `json:"type"`
	PSK        string `json:"psk"`
	LocalCert  string `json:"local_cert"`
	RemoteCert string `json:"remote_cert"`
	PrivateKey string `json:"private_key"`
}

type Endpoint struct {
	RemoteIPSec     string       `json:"remote_ip_sec"`
	LocalIP         string       `json:"local_ip"`
	PeerIP          string       `json:"peer_ip"`
	RemoteAS        int          `json:"remote_as"`
	NAT             bool         `json:"nat"`
	BGP             bool         `json:"bgp"`
	SourceInterface string       `json:"source_interface"`
	Authentication  EndpointAuth `json:"authentication"`
}

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

type VrfWithEndpoints struct {
	Vrf
	Endpoints []Endpoint
}

type FileGenerator struct {
}

func saveCerts(v *VrfWithEndpoints) error {
	for _, e := range v.Endpoints {
		filename := fmt.Sprintf("/opt/ipsec/x509/%s-%s.pem", v.ClientName, e.PeerIP)
		if err := ioutil.WriteFile(filename, []byte(e.Authentication.RemoteCert), 0644); err != nil {
			return ReturnError(err)
		}
		filename = fmt.Sprintf("/opt/ipsec/x509/%s-%s.pem", v.ClientName, e.LocalIP)
		if err := ioutil.WriteFile(filename, []byte(e.Authentication.LocalCert), 0644); err != nil {
			return ReturnError(err)
		}
		filename = fmt.Sprintf("/opt/ipsec/rsa/%s-%s.key.pem", v.ClientName, e.PeerIP)
		if err := ioutil.WriteFile(filename, []byte(e.Authentication.PrivateKey), 0644); err != nil {
			return ReturnError(err)
		}
	}
	return nil
}

func deleteCerts(v *VrfWithEndpoints) error {
	for _, e := range v.Endpoints {
		filenames := []string{
			fmt.Sprintf("/opt/ipsec/x509/%s-%s.pem", v.ClientName, e.PeerIP),
			fmt.Sprintf("/opt/ipsec/x509/%s-%s.pem", v.ClientName, e.LocalIP),
			fmt.Sprintf("/opt/ipsec/rsa/%s-%s.key.pem", v.ClientName, e.PeerIP),
		}
		for _, f := range filenames {
			if err := os.Remove(f); err != nil {
				return ReturnError(err)
			}
		}
	}
	return nil
}

func (FileGenerator) GenerateTemplates(v Vrf) error {
	log.Infof("generating templates for vrf %+v", v)
	vrf, err := convertToVrfWithEndpoints(v)
	if err != nil {
		return ReturnError(err)
	}

	if err := saveCerts(vrf); err != nil {
		return ReturnError(err)
	}

	prefix := calculatePrefix(v)

	data, err := generateStrongswanTemplate(vrf)
	if err != nil {
		return ReturnError(err)
	}
	if err := os.WriteFile(getStrongswanFileName(prefix), []byte(data), 0644); err != nil {
		return ReturnError(err)
	}

	data, err = generateSupervisorTemplate(vrf)
	if err != nil {
		return ReturnError(err)
	}
	if err := os.WriteFile(getSupervisorFileName(prefix), []byte(data), 0644); err != nil {
		return ReturnError(err)
	}

	if err = generateFRRTemplate(v); err != nil {
		return ReturnError(err)
	}

	if err = ReloadSupervisor(); err != nil {
		return ReturnError(err)
	}

	if err = ReloadStrongSwan(); err != nil {
		return ReturnError(err)
	}

	return nil
}

func (FileGenerator) DeleteTemplates(v Vrf) error {
	log.Infof("deleting templates for vrf %+v", v)
	vrf, err := convertToVrfWithEndpoints(v)
	prefix := calculatePrefix(v)
	return ReturnError(
		err,
		os.RemoveAll(getSupervisorFileName(prefix)),
		os.RemoveAll(getStrongswanFileName(prefix)),
		deleteFRRTemplate(v),
		ReloadStrongSwan(),
		ReloadSupervisor(),
		deleteCerts(vrf),
	)
}

func getStrongswanFileName(prefix string) string {
	return "/opt/ipsec/conf/" + prefix + ".conf"
}

func getSupervisorFileName(prefix string) string {
	return "/opt/super_net/" + prefix + ".ini"
}

func convertToVrfWithEndpoints(vrf Vrf) (*VrfWithEndpoints, error) {
	var endpoints []Endpoint
	if vrf.Endpoints != nil {
		val := vrf.Endpoints.String()
		if err := json.Unmarshal([]byte(val), &endpoints); err != nil {
			return nil, ReturnError(err)
		}
	}
	return &VrfWithEndpoints{vrf, endpoints}, nil
}

func calculatePrefix(vrf Vrf) string {
	return fmt.Sprintf("%d_%s", vrf.Vlan, vrf.ClientName)
}

func generateStrongswanTemplate(vrf *VrfWithEndpoints) (string, error) {
	t, err := template.New(strongswanTemplateFile).
		Funcs(template.FuncMap{"calc": calculateIndex, "inc": inc}).
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
	if err = t.Execute(&builder, struct {
		*VrfWithEndpoints
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

func generateSupervisorTemplate(vrf *VrfWithEndpoints) (string, error) {
	t, err := template.New(supervisorTemplateFile).ParseFiles(supervisorTemplatePath)
	if err != nil {
		return "", ReturnError(err)
	}

	localIps := make([]string, 0, len(vrf.Endpoints))
	peerIps := make([]string, 0, len(vrf.Endpoints))
	nats := make([]string, 0, len(vrf.Endpoints))
	for _, endpoint := range vrf.Endpoints {
		localIps = append(localIps, endpoint.LocalIP)
		peerIps = append(peerIps, endpoint.PeerIP)
		if endpoint.NAT {
			nats = append(nats, "YES")
		} else {
			nats = append(nats, "NO")
		}
	}

	builder := strings.Builder{}
	if err = t.Execute(&builder, struct {
		*VrfWithEndpoints
		LocalIPs string
		PeerIPs  string
		LanIPs   string
		Nats     string
	}{
		VrfWithEndpoints: vrf,
		LocalIPs:         strings.Join(localIps, " "),
		PeerIPs:          strings.Join(peerIps, " "),
		Nats:             strings.Join(nats, " "),
	}); err != nil {
		return "", ReturnError(err)
	}
	return builder.String(), nil

}

func inc(i int) int {
	return i + 1
}

func calculateIndex(vlan, index int) int {
	return vlan*100 + index
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
