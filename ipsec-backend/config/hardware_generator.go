/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package config

import (
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"io/ioutil"
	"ipsec_backend/db"
	"ipsec_backend/ipsecclient_yang"
	"ipsec_backend/logger"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"text/template"
	"time"

	"github.com/openconfig/goyang/pkg/yang"
	"github.com/sirupsen/logrus"
)

const (
	switchBase      = "https://%s/restconf/data/"
	hwTemplatesDir  = "hw_templates"
	defaultLocalAdd = "10.67.0.2"
)

type VrfWithCryptoSlices struct {
	db.Vrf
	CryptoPh1Slice []string
	CryptoPh2Slice []string
}

type HardwareGenerator struct {
	localAddr string
	log *logrus.Logger
}

func NewHardwareGenerator(switchCreds db.SwitchCreds, log *logrus.Logger) (*HardwareGenerator, error) {
	log.Info("NewHardwareGenerator invoked")
	nginxLocalIp, isPresent := os.LookupEnv("NGINX_LOCAL_IP")
	if isPresent {
		return &HardwareGenerator{nginxLocalIp, log}, nil
	}

	return &HardwareGenerator{defaultLocalAdd, log}, nil
}

func (h *HardwareGenerator) GenerateConfigs(vrf db.Vrf, switchCreds db.SwitchCreds) error {
	h.log.Info("GenerateConfigs invoked")
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	vrfWithSlices := VrfWithCryptoSlices{}
	vrfWithSlices.Vrf = vrf
	var err error
	vrfWithSlices.CryptoPh1Slice, err = restconfGetCryptoStrings(string(vrf.CryptoPh1), h.log)
	if err != nil {
		return logger.ReturnError(h.log, err)
	}

	vrfWithSlices.CryptoPh2Slice, err = restconfGetCryptoStrings(string(vrf.CryptoPh2), h.log)
	if err != nil {
		return logger.ReturnError(h.log, err)
	}

	pskEndpoints, certsEndpoints := endpointSubsets(vrf)
	h.log.Debug("pskEndpoints", pskEndpoints)
	h.log.Debug("pskEndpoints", certsEndpoints)

	if len(pskEndpoints) > 0 {
		if err := h.doTemplateFolderCreate("psk", client, vrfWithSlices, pskEndpoints, switchCreds); err != nil {
			return logger.ReturnError(h.log, err)
		}
	}

	if len(certsEndpoints) > 0 {
		if err := h.insertPkcs12(vrfWithSlices, client, switchCreds); err != nil {
			return logger.ReturnError(h.log, err)
		}
		if err := h.doTemplateFolderCreate("certs", client, vrfWithSlices, certsEndpoints, switchCreds); err != nil {
			return logger.ReturnError(h.log, err)
		}
	}

	return nil
}

func (h *HardwareGenerator) DeleteConfigs(vrf db.Vrf, switchCreds db.SwitchCreds) error {
	h.log.Info("DeleteConfigs invoked")
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	pskEndpoints, certsEndpoints := endpointSubsets(vrf)
	h.log.Debug("pskEndpoints", pskEndpoints)
	h.log.Debug("pskEndpoints", certsEndpoints)

	if len(pskEndpoints) > 0 {
		if err := h.doTemplateFolderDelete("psk", client, vrf, pskEndpoints, switchCreds); err != nil {
			return logger.ReturnError(h.log, err)
		}
	}

	if len(certsEndpoints) > 0 {
		if err := h.doTemplateFolderDelete("certs", client, vrf, certsEndpoints, switchCreds); err != nil {
			return logger.ReturnError(h.log, err)
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

func espHmacAllowed(encryption string, whenEspHmac string) bool {
	whenEspHmac = strings.Replace(whenEspHmac, "'", " ", -1)
	whenEspHmacList := strings.Fields(whenEspHmac)
	for index := 0; index < len(whenEspHmacList); index++ {
		fmt.Printf("espHmacAllowed %s %s\n", whenEspHmacList[index], encryption)
		if whenEspHmacList[index] == encryption && index-1 >= 0 && whenEspHmacList[index-1] == "!=" {
			return false
		}
	}

	return true
}

func getTemplateFuncMap() template.FuncMap {
	return template.FuncMap{
		"notEndOfSlice": func(l []db.Endpoint, i int) bool {
			return len(l)-1 != i
		},
		"transformSetEsp": func(vrf VrfWithCryptoSlices) string {
			encFunc := strings.Split(vrf.CryptoPh2Slice[0], " ")
			return encFunc[0]
		},
		"transformSetKeyBit": func(vrf VrfWithCryptoSlices) string {
			if encFunc := strings.Split(vrf.CryptoPh2Slice[0], " "); len(encFunc) > 1 {
				return fmt.Sprintf(`"key-bit": "%s",`, encFunc[1])
			}
			return ""
		},
		"transformSetEspHmac": func(vrf VrfWithCryptoSlices, whenEspHmac string) string {
			if espHmacAllowed(strings.Split(vrf.CryptoPh2Slice[0], " ")[0], whenEspHmac) {
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
	}
}

func (h *HardwareGenerator) doTemplateFolderCreate(folderName string, client *http.Client, vrf VrfWithCryptoSlices, endpoints []db.Endpoint, switchCreds db.SwitchCreds) error {
	h.log.Info("doTemplateFolderCreate invoked")
	files, err := ioutil.ReadDir(hwTemplatesDir + "/" + folderName)
	if err != nil {
		return logger.ReturnError(h.log, err)
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
			return logger.ReturnError(h.log, err)
		}
		lines := strings.Split(string(bytes), "\n")
		url := lines[5]
		_ = lines[6] // this is the delete url
		templ := strings.Join(lines[7:], "\n")
		t, err := template.New(file.Name()).Funcs(getTemplateFuncMap()).Parse(templ)
		if err != nil {
			return logger.ReturnError(h.log, err)
		}
		builder := strings.Builder{}
		if err = t.Execute(&builder, struct {
			VrfWithCryptoSlices
			EndpointSubset    []db.Endpoint
			BGPEndpoints4     []db.Endpoint
			BGPEndpoints6     []db.Endpoint
			BGPEndpointSubset []db.Endpoint
			WhenEspHmac       string
		}{
			vrf,
			endpoints,
			bgpEndpointsIpv4,
			bgpEndpointsIpv6,
			bgpEndpoints,
			switchCreds.WhenEspHmac,
		}); err != nil {
			return logger.ReturnError(h.log, err)
		}
		if err := h.tryRestconfPatch(url, builder.String(), client, switchCreds); err != nil {
			return logger.ReturnError(h.log, err)
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
	h.log.Info("doTemplateFolderDelete invoked")
	files, err := ioutil.ReadDir(hwTemplatesDir + "/" + folderName)
	if err != nil {
		return logger.ReturnError(h.log, err)
	}

	files = reverseSlice(files)
	bgpEndpointsIpv4 := bgpEndpointSubset(endpoints, false)
	bgpEndpointsIpv6 := bgpEndpointSubset(endpoints, true)

	for _, file := range files {
		bytes, err := ioutil.ReadFile(hwTemplatesDir + "/" + folderName + "/" + file.Name())
		if err != nil {
			return logger.ReturnError(h.log, err)
		}
		lines := strings.Split(string(bytes), "\n")
		deleteUrlTemplate := lines[6]
		t, err := template.New(file.Name()).Parse(deleteUrlTemplate)
		if err != nil {
			return logger.ReturnError(h.log, err)
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
			return logger.ReturnError(h.log, err)
		}
		for _, url := range strings.Split(builder.String(), " ") {
			if strings.TrimSpace(url) == "" {
				continue
			}
			if err := h.tryRestconfDelete(url, client, switchCreds); err != nil {
				h.log.Error(h.log, err) // but don't stop execution for this, ignore delete errors
			}
		}
	}

	return nil
}

func (h *HardwareGenerator) insertPkcs12(vrf VrfWithCryptoSlices, client *http.Client, switchCreds db.SwitchCreds) error {
	h.log.Info("insertPkcs12 invkoed")
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
			return logger.ReturnError(h.log, err)
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
	h.log.Info("tryRestconfDelete invoked")
	return logger.ReturnError(h.log, h.tryRestconfRequest("DELETE", path, "", client, switchCreds))
}

func (h *HardwareGenerator) tryRestconfPatch(path, data string, client *http.Client, switchCreds db.SwitchCreds) error {
	h.log.Info("tryRestconfPatch invoked")
	return logger.ReturnError(h.log, h.tryRestconfRequest("PATCH", path, data, client, switchCreds))
}

func (h *HardwareGenerator) tryRestconfRequest(method, path, data string, client *http.Client, switchCreds db.SwitchCreds) error {
	h.log.Info("tryRestconfRequest invoked")
	retries := 20
	for i := 0; i < retries; i++ {
		time.Sleep(time.Millisecond * 500)
		h.log.Debugf("%s: %s (%d)\n", method, path, i)
		err := h.restconfDoRequest(method, path, data, client, switchCreds)
		if err == nil {
			h.log.Debugf("%s successful", method)
			return nil
		} else {
			if strings.Contains(err.Error(), "lock-denied") {
				h.log.Debugf("%s lock denied", method)
				continue
			}
			h.log.Debugf("%s other error encountered", method)
			return logger.ReturnError(h.log, err)
		}
	}

	return logger.ReturnError(h.log, fmt.Errorf("%s: retry limit %d exceeded", path, retries))
}

func (h *HardwareGenerator) restconfDoRequest(method, path, data string, client *http.Client, switchCreds db.SwitchCreds) error {
	h.log.Info("restconfDoRequest invoked")
	h.log.Debugf("%s: %s\n%s\n", method, path, data)
	fullPath := fmt.Sprintf(switchBase, switchCreds.SwitchAddress) + path
	req, err := http.NewRequest(method, fullPath, strings.NewReader(data))
	if err != nil {
		return logger.ReturnError(h.log, err)
	}

	req.Header.Add("Content-Type", "application/yang-data+json")
	req.Header.Add("Accept", "application/yang-data+json")
	req.SetBasicAuth(switchCreds.Username, switchCreds.Password)
	resp, err := client.Do(req)
	if err != nil {
		return logger.ReturnError(h.log, err)
	}

	if resp.StatusCode >= 400 {
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return logger.ReturnError(h.log, err)
		}

		return logger.ReturnError(h.log, errors.New(method + " to " + path + " failed (" + strconv.Itoa(resp.StatusCode) + "): " + string(body)))
	}

	return nil
}

func (h *HardwareGenerator) GetMonitoring(_ *string, switchCreds db.SwitchCreds) (*ipsecclient_yang.Ipsecclient_Api_Monitoring, error) {
	h.log.Info("GetMonitoring invoked")
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	res, err := restconfGetData("Cisco-IOS-XE-crypto-oper:crypto-oper-data/crypto-ipsec-ident", client, switchCreds, h.log)
	if err != nil {
		return nil, logger.ReturnError(h.log, err)
	}

	if res == nil {
		return &ipsecclient_yang.Ipsecclient_Api_Monitoring{}, nil
	}

	idents := res["Cisco-IOS-XE-crypto-oper:crypto-ipsec-ident"].([]interface{})
	monitoring := ipsecclient_yang.Ipsecclient_Api_Monitoring{
		Endpoint: map[uint32]*ipsecclient_yang.Ipsecclient_Api_Monitoring_Endpoint{},
	}

	for _, ident_ := range idents {
		ident := ident_.(map[string]interface{})
		endpointIDStr := ident["interface"].(string)[len("Tunnel"):]
		endpointID, _ := strconv.Atoi(endpointIDStr)
		identData := ident["ident-data"].(map[string]interface{})
		localIp := identData["local-endpt-addr"].(string)
		remoteIp := identData["remote-endpt-addr"].(string)
		saStatus := identData["inbound-esp-sa"].(map[string]interface{})["sa-status"].(string)
		monitoring.Endpoint[uint32(endpointID)] = &ipsecclient_yang.Ipsecclient_Api_Monitoring_Endpoint{
			LocalIp: db.StringPointer(normalizeLocalIP(localIp, remoteIp)),
			PeerIp:  db.StringPointer(remoteIp),
			Status:  db.StringPointer(normalizeStatus(saStatus)),
			Id:      db.Uint32Pointer(uint32(endpointID)),
		}
	}

	return &monitoring, nil
}

func GetSourceInterfaces(switchCreds db.SwitchCreds, log *logrus.Logger) ([]string, error) {
	log.Info("GetSourceInterfaces invoked")
	log.Debug(switchCreds)

	sourceInterfaces := []string{}
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	var res map[string]interface{}
	var err error
	for retries := 5; retries > 0; retries-- {
		res, err = restconfGetData("Cisco-IOS-XE-native:native/interface", client, switchCreds ,log)
		if err == nil && res != nil {
			break
		}
	}
	if err != nil {
		return nil, logger.ReturnError(log, err)
	}
	if res == nil {
		return sourceInterfaces, nil
	}

	if interfacesInt, ok := res["Cisco-IOS-XE-native:interface"]; ok {
		if interfaces, ok := interfacesInt.(map[string]interface{}); ok {
			for interfaceName, interfaceBodyList_ := range interfaces {
				if interfaceBodyList, ok := interfaceBodyList_.([]interface{}); ok {
					for _, interfaceBody := range interfaceBodyList {
						interfaceIdstr, ok := interfaceBody.(map[string]interface{})["name"].(string)
						if ok {
							sourceInterfaces = append(sourceInterfaces, interfaceName+interfaceIdstr)
							continue
						}
						interfaceIdfloat, ok := interfaceBody.(map[string]interface{})["name"].(float64)
						if ok {
							sourceInterfaces = append(sourceInterfaces, interfaceName+strconv.Itoa(int(interfaceIdfloat)))
							continue
						}
					}
				}
			}
			return sourceInterfaces, nil
		}
	}

	return sourceInterfaces, logger.ReturnError(log, fmt.Errorf("cannot get source interfaces from the switch - malformed response"))
}

func (h *HardwareGenerator) CheckSwitchBasicAuth(switchCreds db.SwitchCreds) (bool, error) {
	h.log.Info("CheckSwitchBasicAuth")
	h.log.Debug(switchCreds)

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

func getModule(modulePath string, switchCreds db.SwitchCreds) (string, error) {
	var err error
	var module []byte
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	req, err := http.NewRequest(http.MethodGet, modulePath, nil)
	if err != nil {
		return "", fmt.Errorf("prepare request to get module: %s: %w", modulePath, err)
	}
	req.Header.Add("Content-Type", "application/yang-data+json")
	req.Header.Add("Accept", "application/yang-data+json")
	req.SetBasicAuth(switchCreds.Username, switchCreds.Password)

	for retries := 5; retries > 0; retries-- {
		var resp *http.Response
		resp, err = client.Do(req)
		if err != nil {
			continue
		}
		module, err = io.ReadAll(resp.Body)
		if err == nil {
			return string(module), nil
		}

		time.Sleep(3 * time.Second)
		err = fmt.Errorf("cannot get %s algorithm from the hardware: %w", modulePath, err)
	}

	return "", err
}

func parse(ms *yang.Modules, moduleName string, modulePath string, switchCreds db.SwitchCreds) error {
	module, err := getModule(modulePath, switchCreds)
	if err != nil {
		return fmt.Errorf("get module %s: %w", modulePath, err)
	}

	if err := ms.Parse(module, moduleName); err != nil {
		return fmt.Errorf("parse yang module: %s, content: %s, %w", moduleName, module, err)
	}

	return nil
}

func keyBitsAllowed(encryption string, whenKeyBitsList []string) bool {
	for index := 0; index < len(whenKeyBitsList); index++ {
		if whenKeyBitsList[index] == encryption && index-1 >= 0 && whenKeyBitsList[index-1] == "!=" {
			return false
		}
	}
	return true
}

func mergeEncryptions(encryptions []string, keyBits []string, whenKeyBits string) []string {
	whenKeyBits = strings.Replace(whenKeyBits, "'", " ", -1)
	whenKeyBitsList := strings.Fields(whenKeyBits)
	var mergedEncryptions []string
	for _, encryption := range encryptions {
		if keyBitsAllowed(encryption, whenKeyBitsList) {
			for _, keyBit := range keyBits {
				mergedEncryptions = append(mergedEncryptions, encryption+" "+keyBit)
			}
		} else {
			mergedEncryptions = append(mergedEncryptions, encryption)
		}
	}
	return mergedEncryptions
}

func getKeysFromMap(map_ map[string]*yang.Entry) []string {
	keys := make([]string, 0, len(map_))
	for key := range map_ {
		keys = append(keys, key)
	}
	return keys
}

func GetAlgorithms(switchCreds db.SwitchCreds, log *logrus.Logger) (db.Algorithm, string, error) {
	log.Info("GetAlgorithms invoked")
	log.Debug(switchCreds)
	ms := yang.NewModules()

	modulesToParse := []string{"Cisco-IOS-XE-crypto", "cisco-semver", "ietf-inet-types", "Cisco-IOS-XE-native",
		"Cisco-IOS-XE-types", "Cisco-IOS-XE-parser", "Cisco-IOS-XE-license", "Cisco-IOS-XE-features",
		"Cisco-IOS-XE-line", "Cisco-IOS-XE-interface-common", "Cisco-IOS-XE-logging", "Cisco-IOS-XE-ip", "Cisco-IOS-XE-interfaces",
		"Cisco-IOS-XE-ipv6", "Cisco-IOS-XE-tunnel", "Cisco-IOS-XE-mpls", "Cisco-IOS-XE-isis", "Cisco-IOS-XE-snmp",
		"Cisco-IOS-XE-policy", "ietf-yang-types", "Cisco-IOS-XE-atm", "Cisco-IOS-XE-l2vpn", "Cisco-IOS-XE-ethernet",
		"Cisco-IOS-XE-ethernet-oam", "Cisco-IOS-XE-ethernet-cfm-efp", "Cisco-IOS-XE-pppoe",
		"Cisco-IOS-XE-aaa", "Cisco-IOS-XE-hsrp", "Cisco-IOS-XE-location", "Cisco-IOS-XE-transceiver-monitor", "etf-yang-types"}
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	type Submodule struct {
		Name   string `json:"name"`
		Schema string `json:"schema"`
	}

	type Module struct {
		Name      string      `json:"name"`
		Schema    string      `json:"schema"`
		Submodule []Submodule `json:"submodule"`
	}

	var modules struct {
		Modules []Module `json:"ietf-yang-library:module"`
	}

	fullPath := "https://" + switchCreds.SwitchAddress + "/restconf/data/modules-state/module"
	req, err := http.NewRequest(http.MethodGet, fullPath, nil)
	if err != nil {
		return db.Algorithm{}, "", logger.ReturnError(log, fmt.Errorf("prepare request to get modules, path: %s: %w", fullPath, err))
	}
	req.Header.Add("Content-Type", "application/yang-data+json")
	req.Header.Add("Accept", "application/yang-data+json")
	req.SetBasicAuth(switchCreds.Username, switchCreds.Password)
	resp, err := client.Do(req)
	if err != nil {
		return db.Algorithm{}, "", logger.ReturnError(log, fmt.Errorf("do request for modules: %w", err))
	}

	decoder := json.NewDecoder(resp.Body)
	if err := decoder.Decode(&modules); err != nil {
		return db.Algorithm{}, "", logger.ReturnError(log, fmt.Errorf("decoding modules response: %w", err))
	}

	for _, module := range modules.Modules {
		for _, moduleToParse := range modulesToParse {
			if module.Name == moduleToParse {
				if err := parse(ms, module.Name, module.Schema, switchCreds); err != nil {
					return db.Algorithm{}, "", logger.ReturnError(log, fmt.Errorf("parsing module %s: %w", module.Name, err))
				}
			}
		}
		if module.Submodule != nil {
			for _, submodule := range module.Submodule {
				for _, moduleToParse := range modulesToParse {
					if submodule.Name == moduleToParse {
						if err := parse(ms, submodule.Name, submodule.Schema, switchCreds); err != nil {
							return db.Algorithm{}, "", logger.ReturnError(log, fmt.Errorf("parsing submodule %s: %w", submodule.Name, err))
						}
					}
				}
			}
		}
	}

	log.Debug(modules.Modules)

	if errs := ms.Process(); errs != nil {
		e := ""
		for _, err := range errs {
			e += fmt.Sprintf(", %s ", err.Error())
		}

		return db.Algorithm{}, "", logger.ReturnError(log, fmt.Errorf("process yang modules: %w", errors.New(e)))
	}
	nativeModule, _ := ms.GetModule("Cisco-IOS-XE-native")

	phase1Encryption := nativeModule.Dir["native"].Dir["crypto"].Dir["ikev2"].Dir["proposal"].Dir["encryption"].Dir
	phase1Integrity := nativeModule.Dir["native"].Dir["crypto"].Dir["ikev2"].Dir["proposal"].Dir["integrity"].Dir
	phase1KeyExchange := nativeModule.Dir["native"].Dir["crypto"].Dir["ikev2"].Dir["proposal"].Dir["group"].Dir
	phase2Encryption := nativeModule.Dir["native"].Dir["crypto"].Dir["ipsec"].Dir["transform-set"].Dir["esp"].Type.Enum.Names()
	keyBit := nativeModule.Dir["native"].Dir["crypto"].Dir["ipsec"].Dir["transform-set"].Dir["key-bit"].Type.Enum.Names()
	whenKeyBit, _ := nativeModule.Dir["native"].Dir["crypto"].Dir["ipsec"].Dir["transform-set"].Dir["key-bit"].GetWhenXPath()
	phase2Integrity := nativeModule.Dir["native"].Dir["crypto"].Dir["ipsec"].Dir["transform-set"].Dir["esp-hmac"].Type.Enum.Names()
	whenEspHmac, _ := nativeModule.Dir["native"].Dir["crypto"].Dir["ipsec"].Dir["transform-set"].Dir["esp-hmac"].GetWhenXPath()
	phase2KeyExchange := nativeModule.Dir["native"].Dir["crypto"].Dir["ipsec"].Dir["profile"].Dir["set"].Dir["pfs"].Dir["group"].Type.Enum.Names()

	return db.Algorithm{
		Phase1Encryption:  getKeysFromMap(phase1Encryption),
		Phase1Integrity:   getKeysFromMap(phase1Integrity),
		Phase1KeyExchange: getKeysFromMap(phase1KeyExchange),
		Phase2Encryption:  mergeEncryptions(phase2Encryption, keyBit, whenKeyBit),
		Phase2Integrity:   phase2Integrity,
		Phase2KeyExchange: phase2KeyExchange,
	}, whenEspHmac, nil
}

func (h *HardwareGenerator) GetSwitchModel(switchCreds db.SwitchCreds) (string, error) {
	h.log.Info("GetSwitchModel invoked")

	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	fullPath := "https://" + switchCreds.SwitchAddress + "/restconf/data/Cisco-IOS-XE-device-hardware-oper:device-hardware-data/device-hardware/device-inventory=hw-type-chassis,1/part-number"
	req, err := http.NewRequest(http.MethodGet, fullPath, nil)
	if err != nil {
		return "", nil
	}

	req.Header.Add("Content-Type", "application/yang-data+json")
	req.Header.Add("Accept", "application/yang-data+json")
	req.SetBasicAuth(switchCreds.Username, switchCreds.Password)
	resp, err := client.Do(req)
	if err != nil {
		return "", nil
	}

	var model struct {
		Model string `json:"Cisco-IOS-XE-switch:provision"`
	}

	decoder := json.NewDecoder(resp.Body)
	if err := decoder.Decode(&model); err != nil {
		return "",  nil
	}
	h.log.Debug(model.Model)

	return model.Model, nil
}

func restconfGetData(path string, client *http.Client, switchCreds db.SwitchCreds, log *logrus.Logger) (map[string]interface{}, error) {
	log.Info("restconfGetData invoked")
	ret := map[string]interface{}{}
	fullPath := fmt.Sprintf(switchBase, switchCreds.SwitchAddress) + path
	req, err := http.NewRequest("GET", fullPath, nil)
	if err != nil {
		return ret, logger.ReturnError(log, err)
	}

	req.Header.Add("Content-Type", "application/yang-data+json")
	req.Header.Add("Accept", "application/yang-data+json")
	req.SetBasicAuth(switchCreds.Username, switchCreds.Password)
	resp, err := client.Do(req)
	if err != nil {
		return ret, logger.ReturnError(log, err)
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return ret, logger.ReturnError(log, err)
	}

	if resp.StatusCode >= 400 {
		return ret, logger.ReturnError(log, errors.New("get on " + path + " failed (" + strconv.Itoa(resp.StatusCode) + "): " + string(body)))
	}

	if strings.TrimSpace(string(body)) == "" {
		return nil, nil
	}

	if err := json.Unmarshal(body, &ret); err != nil {
		fmt.Println("failed to unmarshal:", string(body))
		return ret, logger.ReturnError(log, err)
	}

	return ret, nil
}

func restconfGetCryptoStrings(cryptoString string, log *logrus.Logger) ([]string, error) {
	log.Info("restconfGetCryptoStrings invoked")
	crypto := []string{}
	if err := json.Unmarshal([]byte(cryptoString), &crypto); err != nil {
		return nil, logger.ReturnError(log, err)
	}

	if len(crypto) < 2 {
		return nil, logger.ReturnError(log, errors.New("malformed crypto: " + strings.Join(crypto, ", ")))
	}
	
	return crypto, nil
}
