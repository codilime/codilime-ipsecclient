/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package config

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"io/ioutil"
	"ipsec_backend/db"
	"ipsec_backend/logger"
	"ipsec_backend/sico_yang"
	"net"
	"net/http"
	"net/http/httptrace"
	"os"
	"strconv"
	"strings"
	"text/template"
	"time"

	log "github.com/sirupsen/logrus"
)

const (
	switchBase      = "https://%s/restconf/data/"
	hwTemplatesDir  = "hw_templates"
	defaultLocalAdd = "10.67.0.1"
)

type VrfWithCryptoSlices struct {
	db.Vrf
	CryptoPh1Slice []string
	CryptoPh2Slice []string
}

type HardwareGenerator struct {
	localAddr string
}

func NewHardwareGenerator(switchCreds db.SwitchCreds) (*HardwareGenerator, error) {
	localAddr := ""
	clientTrace := &httptrace.ClientTrace{
		GotConn: func(info httptrace.GotConnInfo) {
			l := strings.Split(info.Conn.LocalAddr().String(), ":")
			localAddr = l[0]
		},
	}
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	traceCtx := httptrace.WithClientTrace(context.Background(), clientTrace)

	fullPath := fmt.Sprintf(switchBase, switchCreds.SwitchAddress) + "/.well-known/host-meta"
	req, err := http.NewRequestWithContext(traceCtx, http.MethodGet, fullPath, nil)
	if err != nil {
		return nil, logger.ReturnError(err)
	}
	req.Header.Add("Content-Type", "application/yang-data+json")
	req.Header.Add("Accept", "application/yang-data+json")
	req.SetBasicAuth(switchCreds.Username, switchCreds.Password)
	_, err = client.Do(req)
	if err != nil {
		return &HardwareGenerator{defaultLocalAdd}, nil
	}
	return &HardwareGenerator{localAddr}, nil
}

func (h *HardwareGenerator) GenerateConfigs(vrf db.Vrf, switchCredsList ...db.SwitchCreds) error {
	if len(switchCredsList) < 1 {
		return logger.ReturnError(fmt.Errorf("HardwareGenerator GenerateConfigs called without SwitchCreds"))
	}
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	vrfWithSlices := VrfWithCryptoSlices{}
	vrfWithSlices.Vrf = vrf
	var err error
	vrfWithSlices.CryptoPh1Slice, err = restconfGetCryptoStrings(string(vrf.CryptoPh1))
	if err != nil {
		return logger.ReturnError(err)
	}

	vrfWithSlices.CryptoPh2Slice, err = restconfGetCryptoStrings(string(vrf.CryptoPh2))
	if err != nil {
		return logger.ReturnError(err)
	}

	pskEndpoints, certsEndpoints := endpointSubsets(vrf)

	if len(pskEndpoints) > 0 {
		if err := h.doTemplateFolderCreate("psk", client, vrfWithSlices, pskEndpoints, switchCredsList[0]); err != nil {
			return logger.ReturnError(err)
		}
	}

	if len(certsEndpoints) > 0 {
		if err := h.insertPkcs12(vrfWithSlices, client, switchCredsList[0]); err != nil {
			return logger.ReturnError(err)
		}
		if err := h.doTemplateFolderCreate("certs", client, vrfWithSlices, certsEndpoints, switchCredsList[0]); err != nil {
			return logger.ReturnError(err)
		}
	}
	return nil
}

func (h *HardwareGenerator) DeleteConfigs(vrf db.Vrf, switchCredsList ...db.SwitchCreds) error {
	if len(switchCredsList) < 1 {
		return logger.ReturnError(fmt.Errorf("HardwareGenerator GetMonitoring called without SwitchCreds"))
	}
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	pskEndpoints, certsEndpoints := endpointSubsets(vrf)

	if len(pskEndpoints) > 0 {
		if err := h.doTemplateFolderDelete("psk", client, vrf, pskEndpoints, switchCredsList[0]); err != nil {
			return logger.ReturnError(err)
		}
	}

	if len(certsEndpoints) > 0 {
		if err := h.doTemplateFolderDelete("certs", client, vrf, certsEndpoints, switchCredsList[0]); err != nil {
			return logger.ReturnError(err)
		}
	}
	return nil
}

func bgpEndpointSubset(endpoints []db.Endpoint, ipv6 bool) []db.Endpoint {
	bgpEndpoints := []db.Endpoint{}
	for _, e := range endpoints {
		if e.BGP && ipv6 == e.IsIpv6() {
			bgpEndpoints = append(bgpEndpoints, e)
		}
	}
	return bgpEndpoints
}

func (h *HardwareGenerator) doTemplateFolderCreate(folderName string, client *http.Client, vrf VrfWithCryptoSlices, endpoints []db.Endpoint, switchCreds db.SwitchCreds) error {
	files, err := ioutil.ReadDir(hwTemplatesDir + "/" + folderName)
	if err != nil {
		return logger.ReturnError(err)
	}

	bgpEndpointsIpv4 := bgpEndpointSubset(endpoints, false)
	bgpEndpointsIpv6 := bgpEndpointSubset(endpoints, true)
	bgpEndpoints := []db.Endpoint{}
	bgpEndpoints = append(bgpEndpoints, bgpEndpointsIpv4...)
	bgpEndpoints = append(bgpEndpoints, bgpEndpointsIpv6...)

	for _, file := range files {
		if len(bgpEndpoints) == 0 && strings.Contains(file.Name(), "bgp") {
			continue // don't do bgp if not needed
		}
		bytes, err := ioutil.ReadFile(hwTemplatesDir + "/" + folderName + "/" + file.Name())
		if err != nil {
			return logger.ReturnError(err)
		}
		lines := strings.Split(string(bytes), "\n")
		url := lines[5]
		_ = lines[6] // this is the delete url
		templ := strings.Join(lines[7:], "\n")
		t, err := template.New(file.Name()).Funcs(template.FuncMap{
			"notEndOfSlice": func(l []db.Endpoint, i int) bool {
				return len(l)-1 != i
			},
			"transformSetEsp": func(vrf VrfWithCryptoSlices) string {
				if containsADigit(vrf.CryptoPh2Slice[0]) {
					// this is gcm or aes
					encFunc := strings.Split(vrf.CryptoPh2Slice[0], "-")
					return fmt.Sprintf("%s-%s", encFunc[0], encFunc[2])
				}
				return vrf.CryptoPh2Slice[0]
			},
			"transformSetKeyBit": func(vrf VrfWithCryptoSlices) string {
				if containsADigit(vrf.CryptoPh2Slice[0]) {
					// this is gcm or aes
					encFunc := strings.Split(vrf.CryptoPh2Slice[0], "-")
					return fmt.Sprintf(`"key-bit": "%s",`, encFunc[1])
				}
				return ""
			},
			"transformSetEspHmac": func(vrf VrfWithCryptoSlices) string {
				if !strings.Contains(vrf.CryptoPh2Slice[0], "gcm") {
					return fmt.Sprintf(`"esp-hmac":"%s",`, vrf.CryptoPh2Slice[1])
				}
				return ""
			},
			"transformSetTunnelOptionName": func(vrf VrfWithCryptoSlices) string {
				if os.Getenv("CAF_SYSTEM_NAME") == "cat9300X" {
					return "tunnel-choice"
				}
				return "tunnel"
			},
			"transformLocalIDType": func(endpoint db.Endpoint) string {
				return transformLocalIDType(endpoint.Authentication.LocalID)
			},
			"transformLocalID": func(endpoint db.Endpoint) string {
				return transformLocalID(endpoint.Authentication.LocalID)
			},
		}).Parse(templ)
		if err != nil {
			return logger.ReturnError(err)
		}
		builder := strings.Builder{}
		if err = t.Execute(&builder, struct {
			VrfWithCryptoSlices
			EndpointSubset    []db.Endpoint
			BGPEndpoints4     []db.Endpoint
			BGPEndpoints6     []db.Endpoint
			BGPEndpointSubset []db.Endpoint
		}{
			vrf,
			endpoints,
			bgpEndpointsIpv4,
			bgpEndpointsIpv6,
			bgpEndpoints,
		}); err != nil {
			return logger.ReturnError(err)
		}
		if err := h.tryRestconfPatch(url, builder.String(), client, switchCreds); err != nil {
			return logger.ReturnError(err)
		}
	}
	return nil
}

func transformLocalIDType(localID string) string {
	if strings.Contains(localID, "=") {
		return "dn"
	}
	if strings.Contains(localID, "@") {
		if localID[0:2] == "@#" {
			return "key-id"
		}
		if localID[0:1] == "@" {
			return "fqdn"
		}
		return "email"
	}
	if strings.Contains(localID, ":") {
		if net.ParseIP(localID) != nil {
			return "address"
		}
		return "key-id"
	}
	if net.ParseIP(localID) != nil {
		return "address"
	}
	return "fqdn"
}

func transformLocalID(localID string) string {
	if strings.Contains(localID, "=") {
		return ""
	}
	if strings.Contains(localID, "@") {
		if localID[0:2] == "@#" {
			return localID[2:]
		}
		if localID[0:1] == "@" {
			return localID[1:]
		}
	}
	return localID
}

func reverseSlice(s []fs.FileInfo) []fs.FileInfo {
	a := make([]fs.FileInfo, len(s))
	copy(a, s)

	for i := len(a)/2 - 1; i >= 0; i-- {
		opp := len(a) - 1 - i
		a[i], a[opp] = a[opp], a[i]
	}

	return a
}

func (h *HardwareGenerator) doTemplateFolderDelete(folderName string, client *http.Client, vrf db.Vrf, endpoints []db.Endpoint, switchCreds db.SwitchCreds) error {
	files, err := ioutil.ReadDir(hwTemplatesDir + "/" + folderName)
	if err != nil {
		return logger.ReturnError(err)
	}

	files = reverseSlice(files)
	bgpEndpointsIpv4 := bgpEndpointSubset(endpoints, false)
	bgpEndpointsIpv6 := bgpEndpointSubset(endpoints, true)

	for _, file := range files {
		bytes, err := ioutil.ReadFile(hwTemplatesDir + "/" + folderName + "/" + file.Name())
		if err != nil {
			return logger.ReturnError(err)
		}
		lines := strings.Split(string(bytes), "\n")
		deleteUrlTemplate := lines[6]
		t, err := template.New(file.Name()).Parse(deleteUrlTemplate)
		if err != nil {
			return logger.ReturnError(err)
		}
		builder := strings.Builder{}
		if err = t.Execute(&builder, struct {
			db.Vrf
			EndpointSubset []db.Endpoint
			BGPEndpoints4  []db.Endpoint
			BGPEndpoints6  []db.Endpoint
		}{
			vrf,
			endpoints,
			bgpEndpointsIpv4,
			bgpEndpointsIpv6,
		}); err != nil {
			return logger.ReturnError(err)
		}
		for _, url := range strings.Split(builder.String(), " ") {
			if strings.TrimSpace(url) == "" {
				continue
			}
			if err := h.tryRestconfDelete(url, client, switchCreds); err != nil {
				logger.Error(err) // but don't stop execution for this, ignore delete errors
			}
		}
	}
	return nil
}

func (h *HardwareGenerator) insertPkcs12(vrf VrfWithCryptoSlices, client *http.Client, switchCreds db.SwitchCreds) error {
	for _, e := range vrf.Endpoints {
		if err := h.tryRestconfRequest("POST", "Cisco-IOS-XE-rpc:crypto", `{
		"input": {
			"pki":{
				"import": {
					"pkcs12": "http://`+h.localAddr+`/pkcs12/`+strconv.Itoa(int(e.ID))+`",
					"name-drop-node-name": "hardware_certs`+strconv.Itoa(int(e.ID))+`",
					"password": "`+e.Authentication.PSK+`"
				}
			}
		}
		}`, client, switchCreds); err != nil {
			return logger.ReturnError(err)
		}
	}
	return nil
}

func endpointSubsets(vrf db.Vrf) ([]db.Endpoint, []db.Endpoint) {
	pskEndpoints := []db.Endpoint{}
	for _, e := range vrf.Endpoints {
		if e.Authentication.Type == "psk" {
			pskEndpoints = append(pskEndpoints, e)
		}
	}

	certsEndpoints := []db.Endpoint{}
	for _, e := range vrf.Endpoints {
		if e.Authentication.Type == "certs" {
			certsEndpoints = append(certsEndpoints, e)
		}
	}
	return pskEndpoints, certsEndpoints
}

func (h *HardwareGenerator) tryRestconfDelete(path string, client *http.Client, switchCreds db.SwitchCreds) error {
	return logger.ReturnError(h.tryRestconfRequest("DELETE", path, "", client, switchCreds))
}

func containsADigit(str string) bool {
	for _, c := range str {
		if c >= '0' && c <= '9' {
			return true
		}
	}
	return false
}

func (h *HardwareGenerator) tryRestconfPatch(path, data string, client *http.Client, switchCreds db.SwitchCreds) error {
	return logger.ReturnError(h.tryRestconfRequest("PATCH", path, data, client, switchCreds))
}

func (h *HardwareGenerator) tryRestconfRequest(method, path, data string, client *http.Client, switchCreds db.SwitchCreds) error {
	retries := 20
	for i := 0; i < retries; i++ {
		time.Sleep(time.Millisecond * 500)
		log.Debugf("%s: %s (%d)\n", method, path, i)
		err := h.restconfDoRequest(method, path, data, client, switchCreds)
		if err == nil {
			log.Debugf("%s successful", method)
			return nil
		} else {
			if strings.Contains(err.Error(), "lock-denied") {
				log.Debugf("%s lock denied", method)
				continue
			}
			log.Debugf("%s other error encountered", method)
			return logger.ReturnError(err)
		}
	}
	return logger.ReturnError(fmt.Errorf("%s: retry limit %d exceeded", path, retries))
}

func (h *HardwareGenerator) restconfDoRequest(method, path, data string, client *http.Client, switchCreds db.SwitchCreds) error {
	log.Debugf("%s: %s\n%s\n", method, path, data)
	fullPath := fmt.Sprintf(switchBase, switchCreds.SwitchAddress) + path
	req, err := http.NewRequest(method, fullPath, strings.NewReader(data))
	if err != nil {
		return logger.ReturnError(err)
	}
	req.Header.Add("Content-Type", "application/yang-data+json")
	req.Header.Add("Accept", "application/yang-data+json")
	req.SetBasicAuth(switchCreds.Username, switchCreds.Password)
	resp, err := client.Do(req)
	if err != nil {
		return logger.ReturnError(err)
	}
	if resp.StatusCode >= 400 {
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return logger.ReturnError(err)
		}
		return logger.ReturnError(errors.New(method + " to " + path + " failed (" + strconv.Itoa(resp.StatusCode) + "): " + string(body)))
	}
	return nil
}

func (h *HardwareGenerator) GetMonitoring(_ *string, switchCredsList ...db.SwitchCreds) (*sico_yang.SicoIpsec_Api_Monitoring, error) {
	if len(switchCredsList) < 1 {
		return nil, logger.ReturnError(fmt.Errorf("HardwareGenerator GetMonitoring called without SwitchCreds"))
	}
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	res, err := restconfGetData("Cisco-IOS-XE-crypto-oper:crypto-oper-data/crypto-ipsec-ident", client, switchCredsList[0])
	if err != nil {
		return nil, logger.ReturnError(err)
	}
	if res == nil {
		return &sico_yang.SicoIpsec_Api_Monitoring{}, nil
	}
	idents := res["Cisco-IOS-XE-crypto-oper:crypto-ipsec-ident"].([]interface{})
	monitoring := sico_yang.SicoIpsec_Api_Monitoring{
		Endpoint: map[uint32]*sico_yang.SicoIpsec_Api_Monitoring_Endpoint{},
	}
	for _, ident_ := range idents {
		ident := ident_.(map[string]interface{})
		endpointIDStr := ident["interface"].(string)[len("Tunnel"):]
		endpointID, _ := strconv.Atoi(endpointIDStr)
		identData := ident["ident-data"].(map[string]interface{})
		localIp := identData["local-endpt-addr"].(string)
		remoteIp := identData["remote-endpt-addr"].(string)
		saStatus := identData["inbound-esp-sa"].(map[string]interface{})["sa-status"].(string)
		monitoring.Endpoint[uint32(endpointID)] = &sico_yang.SicoIpsec_Api_Monitoring_Endpoint{
			LocalIp: db.StringPointer(normalizeLocalIP(localIp, remoteIp)),
			PeerIp:  db.StringPointer(remoteIp),
			Status:  db.StringPointer(normalizeStatus(saStatus)),
			Id:      db.Uint32Pointer(uint32(endpointID)),
		}
	}
	return &monitoring, nil
}

func GetSourceInterfaces(switchCreds db.SwitchCreds) ([]string, error) {
	sourceInterfaces := []string{}
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	res, err := restconfGetData("Cisco-IOS-XE-native:native/interface", client, switchCreds)
	if err != nil {
		return nil, logger.ReturnError(err)
	}
	if res == nil {
		return sourceInterfaces, nil
	}

	if interfacesInt, ok := res["Cisco-IOS-XE-native:interface"]; ok {
		if interfaces, ok := interfacesInt.(map[string]interface{}); ok {
			for interfaceName, interfaceBodyList_ := range interfaces {
				if interfaceBodyList, ok := interfaceBodyList_.([]interface{}); ok {
					for _, interfaceBody := range interfaceBodyList {
						interfaceId, ok := interfaceBody.(map[string]interface{})["name"].(string)
						if !ok {
							break
						}
						sourceInterfaces = append(sourceInterfaces, interfaceName+interfaceId)
					}
					return sourceInterfaces, nil
				}
			}
		}
	}
	return sourceInterfaces, logger.ReturnError(fmt.Errorf("cannot get source interfaces from the switch - malformed response"))
}

func CheckSwitchBasicAuth(switchCreds db.SwitchCreds, switchAddress string) (bool, error) {
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	fullPath := "https://" + switchCreds.SwitchAddress + "/.well-known/host-meta"
	req, err := http.NewRequest(http.MethodGet, fullPath, nil)
	if err != nil {
		return false, err
	}
	req.Header.Add("Content-Type", "application/yang-data+json")
	req.Header.Add("Accept", "application/yang-data+json")
	req.SetBasicAuth(switchCreds.Username, switchCreds.Password)
	resp, err := client.Do(req)
	if err != nil {
		return false, err
	}
	if resp.StatusCode == 200 {
		return true, nil
	}
	return false, nil
}

func restconfGetData(path string, client *http.Client, switchCreds db.SwitchCreds) (map[string]interface{}, error) {
	log.Debugf("GET: %s\n", path)
	ret := map[string]interface{}{}
	fullPath := fmt.Sprintf(switchBase, switchCreds.SwitchAddress) + path
	req, err := http.NewRequest("GET", fullPath, nil)
	if err != nil {
		return ret, logger.ReturnError(err)
	}
	req.Header.Add("Content-Type", "application/yang-data+json")
	req.Header.Add("Accept", "application/yang-data+json")
	req.SetBasicAuth(switchCreds.Username, switchCreds.Password)
	resp, err := client.Do(req)
	if err != nil {
		return ret, logger.ReturnError(err)
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return ret, logger.ReturnError(err)
	}
	if resp.StatusCode >= 400 {
		return ret, logger.ReturnError(errors.New("get on " + path + " failed (" + strconv.Itoa(resp.StatusCode) + "): " + string(body)))
	}
	if strings.TrimSpace(string(body)) == "" {
		return nil, nil
	}
	if err := json.Unmarshal(body, &ret); err != nil {
		fmt.Println("failed to unmarshal:", string(body))
		return ret, logger.ReturnError(err)
	}
	return ret, nil
}

func restconfGetCryptoStrings(cryptoString string) ([]string, error) {
	crypto := []string{}
	if err := json.Unmarshal([]byte(cryptoString), &crypto); err != nil {
		return nil, logger.ReturnError(err)
	}

	if len(crypto) < 2 {
		return nil, logger.ReturnError(errors.New("malformed crypto: " + strings.Join(crypto, ", ")))
	}
	return crypto, nil
}
