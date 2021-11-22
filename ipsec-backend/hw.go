package main

import (
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"
	"text/template"
	"time"
)

const (
	switchBase     = "https://%s/restconf/data/"
	hwTemplatesDir = "hw_templates"
)

type VrfWithCryptoSlices struct {
	Vrf
	CryptoPh1Slice []string
	CryptoPh2Slice []string
}

func bgpEndpointSubset(endpoints []Endpoint) []Endpoint {
	bgpEndpoints := []Endpoint{}
	for _, e := range endpoints {
		if e.BGP {
			bgpEndpoints = append(bgpEndpoints, e)
		}
	}
	return bgpEndpoints
}

func (a *App) doTemplateFolderCreate(folderName string, client *http.Client, vrf VrfWithCryptoSlices, endpoints []Endpoint) error {
	files, err := ioutil.ReadDir(hwTemplatesDir + "/" + folderName)
	if err != nil {
		return ReturnError(err)
	}

	bgpEndpoints := bgpEndpointSubset(endpoints)

	for _, file := range files {
		bytes, err := ioutil.ReadFile(hwTemplatesDir + "/" + folderName + "/" + file.Name())
		if err != nil {
			return ReturnError(err)
		}
		lines := strings.Split(string(bytes), "\n")
		url := lines[0]
		_ = lines[1] // this is the delete url
		templ := strings.Join(lines[2:], "\n")
		t, err := template.New(file.Name()).Funcs(template.FuncMap{
			"notEndOfSlice": func(l []Endpoint, i int) bool {
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
		}).Parse(templ)
		if err != nil {
			return ReturnError(err)
		}
		builder := strings.Builder{}
		if err = t.Execute(&builder, struct {
			VrfWithCryptoSlices
			EndpointSubset    []Endpoint
			BGPEndpointSubset []Endpoint
		}{
			vrf,
			endpoints,
			bgpEndpoints,
		}); err != nil {
			return ReturnError(err)
		}
		if err := a.tryRestconfPatch(url, builder.String(), client); err != nil {
			return ReturnError(err)
		}
	}
	return nil
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

func (a *App) doTemplateFolderDelete(folderName string, client *http.Client, vrf Vrf, endpoints []Endpoint) error {
	files, err := ioutil.ReadDir(hwTemplatesDir + "/" + folderName)
	if err != nil {
		return ReturnError(err)
	}

	files = reverseSlice(files)
	bgpEndpoints := bgpEndpointSubset(endpoints)

	for _, file := range files {
		bytes, err := ioutil.ReadFile(hwTemplatesDir + "/" + folderName + "/" + file.Name())
		if err != nil {
			return ReturnError(err)
		}
		lines := strings.Split(string(bytes), "\n")
		deleteUrlTemplate := lines[1]
		t, err := template.New(file.Name()).Parse(deleteUrlTemplate)
		if err != nil {
			return ReturnError(err)
		}
		builder := strings.Builder{}
		if err = t.Execute(&builder, struct {
			Vrf
			EndpointSubset    []Endpoint
			BGPEndpointSubset []Endpoint
		}{
			vrf,
			endpoints,
			bgpEndpoints,
		}); err != nil {
			return ReturnError(err)
		}
		for _, url := range strings.Split(builder.String(), " ") {
			if strings.TrimSpace(url) == "" {
				continue
			}
			if err := a.tryRestconfDelete(url, client); err != nil {
				Error(err) // but don't stop execution for this, ignore delete errors
			}
		}
	}
	return nil
}

func (a *App) insertPkcs12(vrf VrfWithCryptoSlices, client *http.Client) error {
	for _, e := range vrf.Endpoints {
		if err := a.tryRestconfRequest("POST", "Cisco-IOS-XE-rpc:crypto", `{
		"input": {
			"pki":{
				"import": {
					"pkcs12": "http://`+a.localAddr+`/pkcs12/`+strconv.Itoa(int(e.ID))+`",
					"name-drop-node-name": "hardware_certs`+strconv.Itoa(int(e.ID))+`",
					"password": "`+e.Authentication.PSK+`"
				}
			}
		}
		}`, client); err != nil {
			return ReturnError(err)
		}
	}
	return nil
}

func endpointSubsets(vrf Vrf) ([]Endpoint, []Endpoint) {
	pskEndpoints := []Endpoint{}
	for _, e := range vrf.Endpoints {
		if e.Authentication.Type == "psk" {
			pskEndpoints = append(pskEndpoints, e)
		}
	}

	certsEndpoints := []Endpoint{}
	for _, e := range vrf.Endpoints {
		if e.Authentication.Type == "certs" {
			certsEndpoints = append(certsEndpoints, e)
		}
	}
	return pskEndpoints, certsEndpoints
}

func (a *App) restconfCreate(vrf Vrf) error {
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
		return ReturnError(err)
	}

	vrfWithSlices.CryptoPh2Slice, err = restconfGetCryptoStrings(string(vrf.CryptoPh2))
	if err != nil {
		return ReturnError(err)
	}

	pskEndpoints, certsEndpoints := endpointSubsets(vrf)

	if len(pskEndpoints) > 0 {
		if err := a.doTemplateFolderCreate("psk", client, vrfWithSlices, pskEndpoints); err != nil {
			return ReturnError(err)
		}
	}

	if len(certsEndpoints) > 0 {
		if err := a.insertPkcs12(vrfWithSlices, client); err != nil {
			return ReturnError(err)
		}
		if err := a.doTemplateFolderCreate("certs", client, vrfWithSlices, certsEndpoints); err != nil {
			return ReturnError(err)
		}
	}
	return nil
}

func (a *App) restconfDelete(vrf Vrf) error {
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	pskEndpoints, certsEndpoints := endpointSubsets(vrf)

	if len(pskEndpoints) > 0 {
		if err := a.doTemplateFolderDelete("psk", client, vrf, pskEndpoints); err != nil {
			return ReturnError(err)
		}
	}

	if len(certsEndpoints) > 0 {
		if err := a.doTemplateFolderDelete("certs", client, vrf, certsEndpoints); err != nil {
			return ReturnError(err)
		}
	}
	return nil
}

func (a *App) tryRestconfDelete(path string, client *http.Client) error {
	return ReturnError(a.tryRestconfRequest("DELETE", path, "", client))
}

func containsADigit(str string) bool {
	for _, c := range str {
		if c >= '0' && c <= '9' {
			return true
		}
	}
	return false
}

func (a *App) tryRestconfPatch(path, data string, client *http.Client) error {
	return ReturnError(a.tryRestconfRequest("PATCH", path, data, client))
}

func (a *App) tryRestconfRequest(method, path, data string, client *http.Client) error {
	retries := 20
	for i := 0; i < retries; i++ {
		time.Sleep(time.Millisecond * 500)
		fmt.Printf("%s: %s (%d)\n", method, path, i)
		err := a.restconfDoRequest(method, path, data, client)
		if err == nil {
			fmt.Println(method, "successful")
			return nil
		} else {
			if strings.Contains(err.Error(), "lock-denied") {
				fmt.Println("lock denied")
				continue
			}
			fmt.Println("other error encountered", err.Error())
			return ReturnError(err)
		}
	}
	fmt.Println("retry limit exceeded")
	return ReturnError(fmt.Errorf("%s: retry limit %d exceeded", path, retries))
}

func (a *App) restconfDoRequest(method, path, data string, client *http.Client) error {
	fmt.Printf("%s: %s\n%s\n", method, path, data)
	fullPath := fmt.Sprintf(switchBase, os.Getenv("SWITCH_ADDRESS")) + path
	req, err := http.NewRequest(method, fullPath, strings.NewReader(data))
	if err != nil {
		return ReturnError(err)
	}
	req.Header.Add("Content-Type", "application/yang-data+json")
	req.Header.Add("Accept", "application/yang-data+json")
	req.SetBasicAuth(a.switchUsername, a.switchPassword)
	resp, err := client.Do(req)
	if err != nil {
		return ReturnError(err)
	}
	if resp.StatusCode >= 400 {
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return ReturnError(err)
		}
		return ReturnError(errors.New(method + " to " + path + " failed (" + strconv.Itoa(resp.StatusCode) + "): " + string(body)))
	}
	return nil
}

func (a *App) restconfGetData(path string, client *http.Client) (map[string]interface{}, error) {
	fmt.Printf("GET: %s\n", path)
	ret := map[string]interface{}{}
	fullPath := fmt.Sprintf(switchBase, os.Getenv("SWITCH_ADDRESS")) + path
	req, err := http.NewRequest("GET", fullPath, nil)
	if err != nil {
		return ret, ReturnError(err)
	}
	req.Header.Add("Content-Type", "application/yang-data+json")
	req.Header.Add("Accept", "application/yang-data+json")
	req.SetBasicAuth(a.switchUsername, a.switchPassword)
	resp, err := client.Do(req)
	if err != nil {
		return ret, ReturnError(err)
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return ret, ReturnError(err)
	}
	if resp.StatusCode >= 400 {
		return ret, ReturnError(errors.New("get on " + path + " failed (" + strconv.Itoa(resp.StatusCode) + "): " + string(body)))
	}
	if strings.TrimSpace(string(body)) == "" {
		return nil, nil
	}
	if err := json.Unmarshal(body, &ret); err != nil {
		fmt.Println("failed to unmarshal:", string(body))
		return ret, ReturnError(err)
	}
	return ret, nil
}

func restconfGetCryptoStrings(cryptoString string) ([]string, error) {
	crypto := []string{}
	if err := json.Unmarshal([]byte(cryptoString), &crypto); err != nil {
		return nil, ReturnError(err)
	}

	if len(crypto) < 2 {
		return nil, ReturnError(errors.New("malformed crypto: " + strings.Join(crypto, ", ")))
	}
	return crypto, nil
}
