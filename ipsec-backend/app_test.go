package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"reflect"
	"testing"
)

var a App

type MockGenerator struct {
}

func (MockGenerator) GenerateTemplates(v Vrf) error {
	return nil
}

func TestMain(m *testing.M) {
	dbName := "file::memory:?cache=shared"
	a.Initialize(dbName)
	a.Generator = MockGenerator{}
	code := m.Run()
	os.Exit(code)
}

func TestEmptyTable(t *testing.T) {
	clearTable()

	req, _ := http.NewRequest(http.MethodGet, vrfsPath, nil)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	if body := response.Body.String(); body != "[]" {
		t.Fatalf("Expected an empty array. Got %s", body)
	}
}

func executeRequest(req *http.Request) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	a.Router.ServeHTTP(rr, req)

	return rr
}

func checkResponseCode(t *testing.T, expected, actual int) {
	if expected != actual {
		t.Fatalf("Expected response code %d. Got %d\n", expected, actual)
	}
}

func TestGetNonExistentVrf(t *testing.T) {
	clearTable()

	req, _ := http.NewRequest(http.MethodGet, vrfsPath+"/42", nil)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusNotFound, response.Code)

	var m map[string]string
	if err := json.Unmarshal(response.Body.Bytes(), &m); err != nil {
		t.Fatalf("error during unmarshal %v", err)
	}
	if m["error"] != "Vrf not found" {
		t.Fatalf("Expected the 'error' key of the response to be set to 'Vrf not found'. Got '%s'", m["error"])
	}
}

func TestCreateVrf(t *testing.T) {
	clearTable()

	endpoints := []map[string]interface{}{{
		"remote_ipsec": "10.10.10.10",
	}}
	data := map[string]interface{}{
		"endpoints":   endpoints,
		"client_name": "test vrf",
		"vlan":        1000,
	}
	dataJSON, _ := json.Marshal(data)

	req, _ := http.NewRequest(http.MethodPost, vrfsPath, bytes.NewBuffer(dataJSON))
	req.Header.Set("Content-Type", "application/json")

	response := executeRequest(req)
	checkResponseCode(t, http.StatusCreated, response.Code)

	var m map[string]interface{}
	if err := json.Unmarshal(response.Body.Bytes(), &m); err != nil {
		t.Fatalf("error during unmarshal %v", err)
	}

	if m["client_name"] != "test vrf" {
		t.Fatalf("Expected vrf client_name to be 'test vrf'. Got '%v'", m["client_name"])
	}

	if m["vlan"] != 1000.0 {
		t.Fatalf("Expected vrf vlan to be '1000'. Got '%v'", m["vlan"])
	}

	if m["id"] != 1.0 {
		t.Fatalf("Expected vrf ID to be '1'. Got '%v'", m["id"])
	}

	if !reflect.DeepEqual(m["endpoints"].([]interface{})[0], endpoints[0]) {
		t.Fatalf("Expected endpoints to be %v, got %v", endpoints, m["endpoints"])
	}
}

func TestGetVrf(t *testing.T) {
	clearTable()
	addVrf(t)

	req, _ := http.NewRequest(http.MethodGet, vrfsPath+"/1", nil)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)
}

func TestUpdateVrf(t *testing.T) {
	clearTable()
	addVrf(t)

	req, _ := http.NewRequest(http.MethodGet, vrfsPath+"/1", nil)
	response := executeRequest(req)
	var originalVrf map[string]interface{}
	if err := json.Unmarshal(response.Body.Bytes(), &originalVrf); err != nil {
		t.Fatalf("error during unmarshal %v", err)
	}

	var jsonStr = []byte(`{"client_name":"test vrf - updated name", "vlan": 1001}`)
	req, _ = http.NewRequest("PUT", vrfsPath+"/1", bytes.NewBuffer(jsonStr))
	req.Header.Set("Content-Type", "application/json")

	response = executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var m map[string]interface{}
	if err := json.Unmarshal(response.Body.Bytes(), &m); err != nil {
		t.Fatalf("error during unmarshal %v", err)
	}

	if m["id"] != originalVrf["id"] {
		t.Fatalf("Expected the id to remain the same (%v). Got %v", originalVrf["id"], m["id"])
	}

	if m["client_name"] == originalVrf["client_name"] {
		t.Fatalf("Expected the client_name to change from '%v' to '%v'. Got '%v'", originalVrf["client_name"], m["client_name"], m["client_name"])
	}

	if m["vlan"] == originalVrf["vlan"] {
		t.Fatalf("Expected the vlan to change from '%v' to '%v'. Got '%v'", originalVrf["vlan"], m["vlan"], m["vlan"])
	}
}

func TestDeleteVrf(t *testing.T) {
	clearTable()
	addVrf(t)

	req, _ := http.NewRequest(http.MethodGet, vrfsPath+"/1", nil)
	response := executeRequest(req)
	checkResponseCode(t, http.StatusOK, response.Code)

	req, _ = http.NewRequest("DELETE", vrfsPath+"/1", nil)
	response = executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	req, _ = http.NewRequest(http.MethodGet, vrfsPath+"/1", nil)
	response = executeRequest(req)
	checkResponseCode(t, http.StatusNotFound, response.Code)
}

func clearTable() {
	a.DB.Where("1=1").Delete(Vrf{})
}

func addVrf(t *testing.T) {
	vrf := Vrf{ClientName: "Vrf1", Vlan: 1000}
	res := a.DB.Create(&vrf)
	if res.Error != nil {
		t.Fatalf("Error whlie inserting: %v", res.Error)
	}
}
