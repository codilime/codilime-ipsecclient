package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"text/template"
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
	LanIP       string `json:"lan_ip"`
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
	vrf, err := convertToVrfWithEndpoints(v)
	if err != nil {
		return err
	}

	prefix := calculatePrefix(vrf)

	data, err := generateStrongswanTemplate(vrf)
	if err != nil {
		return err
	}
	if err := os.WriteFile(prefix+".conf", []byte(data), 0644); err != nil {
		return err
	}

	data, err = generateSupervisorTemplate(vrf)
	if err != nil {
		return err
	}
	if err := os.WriteFile(prefix+".ini", []byte(data), 0644); err != nil {
		return err
	}

	data, err = generateBirdTemplate(vrf)
	if err != nil {
		return err
	}
	if err := os.WriteFile(prefix+"_bird.conf", []byte(data), 0644); err != nil {
		return err
	}

	return nil
}

func convertToVrfWithEndpoints(vrf Vrf) (*VrfWithEndpoints, error) {
	var endpoints []Endpoint
	val := vrf.Endpoints.String()
	if err := json.Unmarshal([]byte(val), &endpoints); err != nil {
		return nil, err
	}
	return &VrfWithEndpoints{vrf, endpoints}, nil
}

func calculatePrefix(vrf *VrfWithEndpoints) string {
	return fmt.Sprintf("%d_%s", vrf.Vlan, vrf.ClientName)
}

func generateStrongswanTemplate(vrf *VrfWithEndpoints) (string, error) {
	t, err := template.New(strongswanTemplateFile).
		Funcs(template.FuncMap{"calc": calculateIndex}).
		ParseFiles(strongswanTemplatePath)
	if err != nil {
		return "", err
	}
	builder := strings.Builder{}
	if err = t.Execute(&builder, vrf); err != nil {
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
	lanIps := make([]string, 0, len(vrf.Endpoints))
	nats := make([]string, 0, len(vrf.Endpoints))
	for _, endpoint := range vrf.Endpoints {
		localIps = append(localIps, endpoint.LocalIP)
		peerIps = append(peerIps, endpoint.PeerIP)
		lanIps = append(lanIps, endpoint.LanIP)
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
		LanIPs:           strings.Join(lanIps, " "),
		Nats:             strings.Join(nats, " "),
	}); err != nil {
		return "", err
	}
	return builder.String(), nil

}

func generateBirdTemplate(vrf *VrfWithEndpoints) (string, error) {
	t, err := template.New(birdTemplateFile).
		Funcs(template.FuncMap{"calc": calculateIndex}).
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

func calculateIndex(vlan, index int) int {
	return vlan*100 + index
}
