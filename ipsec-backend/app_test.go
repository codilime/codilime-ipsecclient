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
var mock MockGenerator

type MockGenerator struct {
	genCalled int
	delCalled int
}

func (m *MockGenerator) GenerateTemplates(v Vrf) error {
	m.genCalled++
	return nil
}

func (m *MockGenerator) DeleteTemplates(v Vrf) error {
	m.delCalled++
	return nil
}

func (m *MockGenerator) reset() {
	m.delCalled = 0
	m.genCalled = 0
}

func TestMain(m *testing.M) {
	dbName := "file::memory:?cache=shared"
	a.Initialize(dbName)
	mock = MockGenerator{}
	a.Generator = &mock
	code := m.Run()
	os.Exit(code)
}

func TestEmptyTable(t *testing.T) {
	clearTable()

	req, _ := http.NewRequest(http.MethodGet, vrfsPath, nil)
	req.SetBasicAuth("admin", "cisco123")
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	if body := response.Body.String(); body != "[]" {
		t.Fatalf("Expected an empty array. Got %s", body)
	}
}

func TestGetNonExistentVrf(t *testing.T) {
	clearTable()

	req, _ := http.NewRequest(http.MethodGet, vrfsPath+"/42", nil)
	req.SetBasicAuth("admin", "cisco123")
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

	active := true
	jsonVlans, err := json.Marshal([]Vlan{{1000, "10"}, {2000, "20"}})
	if err != nil {
		t.Fatalf("error during encode vlans %v\n", err)
	}
	jsonCryptoPhase1, err := json.Marshal([]string{"aes123", "sha234", "modp345"})
	if err != nil {
		t.Fatalf("error during encode crypto_phase_1 %v\n", err)
	}
	jsonCryptoPhase2, err := json.Marshal([]string{"camellia456", "md567", "frodos678"})
	if err != nil {
		t.Fatalf("error during encode crypto_phase_2 %v\n", err)
	}
	expectedVrf := Vrf{
		1,
		"test vrf",
		jsonVlans,
		jsonCryptoPhase1,
		jsonCryptoPhase2,
		"test interface",
		&active,
		3,
		[]Endpoint{{
			1,
			1,
			"192.168.0.1",
			"0.0.0.1",
			"10.42.0.1",
			3,
			true,
			false,
			"eth3",
			EndpointAuth{"type12", "psk23", "localcert34", "remotecert45", "privatekey56"}}}}

	data := map[string]interface{}{
		"client_name":        expectedVrf.ClientName,
		"vlans":              expectedVrf.Vlans,
		"crypto_ph1":         expectedVrf.CryptoPh1,
		"crypto_ph2":         expectedVrf.CryptoPh2,
		"physical_interface": expectedVrf.PhysicalInterface,
		"active":             expectedVrf.Active,
		"local_as":           expectedVrf.LocalAs,
		"endpoints":          expectedVrf.Endpoints,
	}
	dataJSON, err := json.Marshal(data)
	if err != nil {
		t.Fatalf("error during encode data %v\n", err)
	}

	req, err := http.NewRequest(http.MethodPost, vrfsPath, bytes.NewBuffer(dataJSON))
	if err != nil {
		t.Fatalf("error during create request %v\n", err)
	}
	req.SetBasicAuth("admin", "cisco123")
	req.Header.Set("Content-Type", "application/json")

	response := executeRequest(req)
	checkResponseCode(t, http.StatusCreated, response.Code)

	var receivedVrf Vrf
	decoder := json.NewDecoder(response.Body)
	if err := decoder.Decode(&receivedVrf); err != nil {
		t.Fatalf("error during decode %v\n", err)
	}

	if expectedVrf.ClientName != receivedVrf.ClientName {
		t.Fatalf("Expected vrf client name to be '%v'. Got '%v'\n", expectedVrf.ClientName, receivedVrf.ClientName)
	}

	if !reflect.DeepEqual(expectedVrf.Vlans, receivedVrf.Vlans) {
		t.Fatalf("Expected vrf vlan to be %v Got %v\n", expectedVrf.Vlans, receivedVrf.Vlans)
	}

	if !reflect.DeepEqual(expectedVrf.CryptoPh1, receivedVrf.CryptoPh1) {
		t.Fatalf("Expected vrf cryptoPhase1 to be %v Got %v\n", expectedVrf.CryptoPh1, receivedVrf.CryptoPh1)
	}

	if !reflect.DeepEqual(expectedVrf.CryptoPh2, receivedVrf.CryptoPh2) {
		t.Fatalf("Expected vrf crypto_phase_2 to be %v Got %v\n", expectedVrf.CryptoPh2, receivedVrf.CryptoPh2)
	}

	if expectedVrf.PhysicalInterface != receivedVrf.PhysicalInterface {
		t.Fatalf("Expected vrf physical_interface to be '%v'. Got '%v'\n", expectedVrf.PhysicalInterface, receivedVrf.PhysicalInterface)
	}

	if *expectedVrf.Active != *receivedVrf.Active {
		t.Fatalf("Expected vrf active to be '%v'. Got '%v'\n", *expectedVrf.Active, *receivedVrf.Active)
	}

	if expectedVrf.LocalAs != receivedVrf.LocalAs {
		t.Fatalf("Expected vrf local_as to be '%v'. Got '%v'\n", expectedVrf.LocalAs, receivedVrf.LocalAs)
	}

	if !reflect.DeepEqual(expectedVrf.Endpoints, receivedVrf.Endpoints) {
		t.Fatalf("Expected vrf endpoints to be '%v'. Got '%v'\n", expectedVrf.Endpoints, receivedVrf.Endpoints)
	}

	var vrfs []Vrf
	a.DB.Preload("Endpoints").Find(&vrfs)
	storedVrf := vrfs[0]
	if !reflect.DeepEqual(expectedVrf, storedVrf) {
		t.Fatalf("Expected stored vrf to be '%v'. Got '%v'\n", expectedVrf, storedVrf)
	}
}

func TestGetVrf(t *testing.T) {
	t.SkipNow()
	clearTable()
	addVrf(t)

	req, _ := http.NewRequest(http.MethodGet, vrfsPath+"/1", nil)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)
}

func TestUpdateVrf(t *testing.T) {
	t.SkipNow()
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

func TestVrfActivation(t *testing.T) {
	t.SkipNow()
	clearTable()
	addVrf(t)

	jsonStrActive := []byte(`{"active": true}`)
	req, _ := http.NewRequest("PUT", vrfsPath+"/1", bytes.NewBuffer(jsonStrActive))
	req.Header.Set("Content-Type", "application/json")

	response := executeRequest(req)
	checkResponseCode(t, http.StatusOK, response.Code)

	if mock.genCalled != 1 {
		t.Fatalf("Expected generator to be called once, got %d", mock.genCalled)
	}
	if mock.delCalled != 0 {
		t.Fatalf("Expected delete to not be called, got %d", mock.delCalled)
	}

	mock.reset()
	jsonStrInactive := []byte(`{"active": false}`)
	req, _ = http.NewRequest("PUT", vrfsPath+"/1", bytes.NewBuffer(jsonStrInactive))
	req.Header.Set("Content-Type", "application/json")

	response = executeRequest(req)
	checkResponseCode(t, http.StatusOK, response.Code)

	if mock.genCalled != 0 {
		t.Fatalf("Expected generator not to be called, got %d", mock.genCalled)
	}
	if mock.delCalled != 1 {
		t.Fatalf("Expected delete to be called once, got %d", mock.delCalled)
	}

	mock.reset()
	req, _ = http.NewRequest("PUT", vrfsPath+"/1", bytes.NewBuffer(jsonStrActive))
	req.Header.Set("Content-Type", "application/json")

	response = executeRequest(req)
	checkResponseCode(t, http.StatusOK, response.Code)

	if mock.genCalled != 1 {
		t.Fatalf("Expected generator to be called once, got %d", mock.genCalled)
	}
	if mock.delCalled != 0 {
		t.Fatalf("Expected delete to not be called, got %d", mock.delCalled)
	}

	mock.reset()
	req, _ = http.NewRequest("PUT", vrfsPath+"/1", bytes.NewBuffer(jsonStrActive))
	req.Header.Set("Content-Type", "application/json")

	response = executeRequest(req)
	checkResponseCode(t, http.StatusOK, response.Code)

	if mock.genCalled != 1 {
		t.Fatalf("Expected generator to be called once, got %d", mock.genCalled)
	}
	if mock.delCalled != 1 {
		t.Fatalf("Expected delete to be called once, got %d", mock.delCalled)
	}
}

func TestDeleteVrf(t *testing.T) {
	t.SkipNow()
	clearTable()
	addVrf(t)

	req, _ := http.NewRequest(http.MethodGet, vrfsPath+"/1", nil)
	response := executeRequest(req)
	checkResponseCode(t, http.StatusOK, response.Code)

	req, _ = http.NewRequest(http.MethodDelete, vrfsPath+"/1", nil)
	response = executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	req, _ = http.NewRequest(http.MethodGet, vrfsPath+"/1", nil)
	response = executeRequest(req)
	checkResponseCode(t, http.StatusNotFound, response.Code)
}

func TestErrorDatabase(t *testing.T) {
	clearTable()
	expectedErrorMessage := "no basic auth"
	expectedNumberOfErrors := 1

	req, err := http.NewRequest(http.MethodGet, vrfsPath, nil)
	if err != nil {
		t.Fatalf("error during create request %v\n", err)
	}
	response := executeRequest(req)

	checkResponseCode(t, http.StatusUnauthorized, response.Code)

	var errors []StoredError
	if result := a.DB.Find(&errors); int64(expectedNumberOfErrors) != result.RowsAffected {
		t.Fatalf("Expected number of errors to be %v got %v", expectedNumberOfErrors, result.RowsAffected)
	}
	if storedError := errors[len(errors)-1]; storedError.Message != expectedErrorMessage {
		t.Fatalf("Expected error message to be %v, got %v", expectedErrorMessage, storedError.Message)
	}
}

func clearTable() {
	a.DB.Where("1=1").Delete(Vrf{})
	a.DB.Where("1=1").Delete(StoredError{})
}

func addVrf(t *testing.T) {
	active := false
	vlans := []map[string]interface{}{
		{
			"vlan":   1000,
			"lan_ip": "10.0.0.0/24",
		},
	}
	vlansJson, _ := json.Marshal(vlans)
	vrf := Vrf{ClientName: "Vrf1", Vlans: vlansJson, Active: &active}
	res := a.DB.Create(&vrf)
	if res.Error != nil {
		t.Fatalf("Error while inserting: %v", res.Error)
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
