package main

import (
	"encoding/json"
	"fmt"
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
	birdTemplateFile       = "bird.conf.template"
	birdTemplatePath       = templatesFolder + birdTemplateFile
)

type Endpoint struct {
	RemoteIPSec string `json:"remote_ip_sec"`
	LocalIP     string `json:"local_ip"`
	PeerIP      string `json:"peer_ip"`
	PSK         string `json:"psk"`
	NAT         bool   `json:"nat"`
	BGP         bool   `json:"bgp"`
}

type VrfWithEndpoints struct {
	Vrf
	Endpoints []Endpoint
}

type FileGenerator struct {
}

func (FileGenerator) GenerateTemplates(v Vrf) error {
	log.Infof("generating templates for vrf %+v", v)
	vrf, err := convertToVrfWithEndpoints(v)
	if err != nil {
		return err
	}

	prefix := calculatePrefix(v)

	data, err := generateStrongswanTemplate(vrf)
	if err != nil {
		return err
	}
	if err := os.WriteFile(getStrongswanFileName(prefix), []byte(data), 0644); err != nil {
		return err
	}

	data, err = generateSupervisorTemplate(vrf)
	if err != nil {
		return err
	}
	if err := os.WriteFile(getSupervisorFileName(prefix), []byte(data), 0644); err != nil {
		return err
	}

	data, err = generateBirdTemplate(vrf)
	if err != nil {
		return err
	}
	if err := os.WriteFile(getBirdFileName(prefix), []byte(data), 0644); err != nil {
		return err
	}

	if err = ReloadSupervisor(); err != nil {
		return err
	}

	if err = ReloadStrongSwan(); err != nil {
		return err
	}

	if err = ReloadBird(); err != nil {
		return err
	}

	return nil
}

func (FileGenerator) DeleteTemplates(v Vrf) error {
	log.Infof("deleting templates for vrf %+v", v)
	prefix := calculatePrefix(v)
	if err := os.RemoveAll(getBirdFileName(prefix)); err != nil {
		return err
	}
	if err := os.RemoveAll(getSupervisorFileName(prefix)); err != nil {
		return err
	}
	if err := os.RemoveAll(getStrongswanFileName(prefix)); err != nil {
		return err
	}
	if err := ReloadBird(); err != nil {
		return err
	}
	if err := ReloadStrongSwan(); err != nil {
		return err
	}
	if err := ReloadSupervisor(); err != nil {
		return err
	}
	return nil
}

func getStrongswanFileName(prefix string) string {
	return "/opt/ipsec/" + prefix + ".conf"
}

func getSupervisorFileName(prefix string) string {
	return "/opt/super/" + prefix + ".ini"
}

func getBirdFileName(prefix string) string {
	return "/opt/bird/" + prefix + "_bird.conf"
}

func convertToVrfWithEndpoints(vrf Vrf) (*VrfWithEndpoints, error) {
	var endpoints []Endpoint
	if vrf.Endpoints != nil {
		val := vrf.Endpoints.String()
		if err := json.Unmarshal([]byte(val), &endpoints); err != nil {
			return nil, err
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
		return "", err
	}
	builder := strings.Builder{}
	crypto1, err := convertToString(vrf.CryptoPh1)
	if err != nil {
		return "", err
	}
	crypto2, err := convertToString(vrf.CryptoPh2)
	if err != nil {
		return "", err
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
		return "", err
	}
	return builder.String(), nil
}

func generateSupervisorTemplate(vrf *VrfWithEndpoints) (string, error) {
	t, err := template.New(supervisorTemplateFile).ParseFiles(supervisorTemplatePath)
	if err != nil {
		return "", err
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
		return "", err
	}
	return builder.String(), nil

}

func generateBirdTemplate(vrf *VrfWithEndpoints) (string, error) {
	t, err := template.New(birdTemplateFile).
		ParseFiles(birdTemplatePath)
	if err != nil {
		return "", err
	}
	builder := strings.Builder{}
	if err = t.Execute(&builder, vrf); err != nil {
		return "", err
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
		return "", err
	}
	var arr []string
	if err = json.Unmarshal(m, &arr); err != nil {
		return "", err
	}
	res := strings.Join(arr, "-")
	return strings.ReplaceAll(res, "--", "-"), nil
}
