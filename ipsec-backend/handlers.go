package main

import (
	"fmt"
	"net/http"
	"strings"
	"text/template"
)

const STRONGSWAN_TEMPLATE_FILE = "templates/strongswan.conf.template"

func TestHandler(req *http.Request) (interface{}, http.Header, int) {
	return JSON{"status": "ok"}, http.Header{}, 200
}

func testFun2() error {
	return ReturnNewError("test error")
}

func testFun() error {
	return ReturnError(testFun2())
}

func Test2Handler(req *http.Request) (interface{}, http.Header, int) {
	return ReturnError(testFun()), http.Header{}, 500
}

type StrongswanVars struct {
	ID           int
	ClientName   string
	TunnelNumber int
	RemoteIPSec  string
	CryptoPH1    string
	PSK          string
}

func generateStrongswanTemplate(vars *StrongswanVars) (string, error) {
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

func TestTemplateHandler(req *http.Request) (interface{}, http.Header, int) {
	testVars := StrongswanVars{
		123,
		"Client",
		234,
		"1.2.3.4",
		"aes128-sha256-x25519",
		"dfsghjidfashgjidhfsgdsghfdighi",
	}
	str, err := generateStrongswanTemplate(&testVars)
	if err != nil {
		return err, nil, 500
	}
	fmt.Println(str)
	return JSON{"generated": str}, nil, 200
}
