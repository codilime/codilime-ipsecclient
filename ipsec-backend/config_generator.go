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
	if err := os.WriteFile("/opt/ipsec/"+prefix+".conf", []byte(data), 0644); err != nil {
		return err
	}

	data, err = generateSupervisorTemplate(vrf)
	if err != nil {
		return err
	}
	if err := os.WriteFile("/opt/super/"+prefix+".ini", []byte(data), 0644); err != nil {
		return err
	}

	data, err = generateBirdTemplate(vrf)
	if err != nil {
		return err
	}
	if err := os.WriteFile("/opt/bird/"+prefix+"_bird.conf", []byte(data), 0644); err != nil {
		return err
	}

	if err = ReloadSupervisor(); err != nil {
		return err
	}

	if err = ReloadStrongSwan(vrf); err != nil {
		return err
	}

	return nil
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

func calculatePrefix(vrf *VrfWithEndpoints) string {
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
