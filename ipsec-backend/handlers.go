package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"text/template"
)

const (
	STRONGSWAN_TEMPLATE_FILE = "templates/strongswan.conf.template"
	STRONGSWAN_CONF_LOCATION = "/tmp/strongswan.conf"
)

func TestHandler(req *http.Request) (interface{}, http.Header, int) {
	return JSON{"status": "ok"}, http.Header{}, 200
}

type StrongswanVars struct {
	ID           int
	ClientName   string
	TunnelNumber int
	RemoteIPSec  string
	CryptoPH1    string
	PSK          string
}

func generateStrongswanTemplate(vars []StrongswanVars) (string, error) {
	t, err := template.ParseFiles(STRONGSWAN_TEMPLATE_FILE)
	if err != nil {
		return "", ReturnError(err)
	}
	builder := strings.Builder{}
	err = t.Execute(&builder, vars)
	if err != nil {
		return "", ReturnError(err)
	}
	return builder.String(), nil
}

func UpdateConfigHandler(req *http.Request) (interface{}, http.Header, int) {
	if req.Method != "POST" {
		return ReturnNewError("wrong request method: " + req.Method), nil, 400
	}
	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		return ReturnError(err), nil, 400
	}
	fmt.Println(string(body))
	var tunnels []StrongswanVars
	err = json.Unmarshal(body, &tunnels)
	if err != nil {
		return ReturnError(err), nil, 400
	}
	strongswanConf, err := generateStrongswanTemplate(tunnels)
	if err != nil {
		return ReturnError(err), nil, 500
	}
	err = ioutil.WriteFile(STRONGSWAN_CONF_LOCATION, []byte(strongswanConf), 0644)
	if err != nil {
		return ReturnError(err), nil, 500
	}
	return JSON{"status": "ok"}, nil, 200
}

// func TestTemplateHandler(req *http.Request) (interface{}, http.Header, int) {
// 	testVars := StrongswanVars{
// 		123,
// 		"Client",
// 		234,
// 		"1.2.3.4",
// 		"aes128-sha256-x25519",
// 		"dfsghjidfashgjidhfsgdsghfdighi",
// 	}
// 	str, err := generateStrongswanTemplate(&testVars)
// 	if err != nil {
// 		return err, nil, 500
// 	}
// 	fmt.Println(str)
// 	return JSON{"generated": str}, nil, 200
// }
