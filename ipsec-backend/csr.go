package main

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"strconv"

	log "github.com/sirupsen/logrus"
)

const (
	csrBase     = "https://10.5.0.10/restconf/data/Cisco-IOS-XE-native:native"
	csrUsername = "admin"
	csrPassword = "cisco123"
)

func createLoopbackInterface(client *http.Client, description string) error {
	loopback := map[string]interface{}{
		"Cisco-IOS-XE-native:Loopback": map[string]interface{}{
			"name":        2,
			"description": description,
			"ip": map[string]interface{}{
				"address": map[string]interface{}{
					"primary": map[string]interface{}{
						"address": "192.168.10.1",
						"mask":    "255.255.255.0",
					},
				},
			},
		},
	}

	var buf bytes.Buffer
	data, err := json.Marshal(&loopback)
	if err != nil {
		return err
	}
	_, err = buf.Write(data)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("PUT", csrBase+"/interface/Loopback=2", &buf)
	if err != nil {
		return err
	}
	req.Header.Add("Content-Type", "application/yang-data+json")
	req.SetBasicAuth(csrUsername, csrPassword)
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	if resp.StatusCode >= 400 {
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		return errors.New("interface creation failed (" + strconv.Itoa(resp.StatusCode) + "): " + string(body))
	}

	return nil
}

func listInterfaces(client *http.Client) ([]byte, error) {
	req, err := http.NewRequest("GET", csrBase+"/interface", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Add("Accept", "application/yang-data+json")
	req.SetBasicAuth(csrUsername, csrPassword)
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return body, nil
}

func testCSR(w http.ResponseWriter, r *http.Request) {
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	err := createLoopbackInterface(client, r.URL.Query().Get("description"))
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	body, err := listInterfaces(client)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)
	if _, err := w.Write(body); err != nil {
		log.Errorf("Error while writing the response: %v", err)
	}
}
