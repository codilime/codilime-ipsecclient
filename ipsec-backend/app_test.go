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

	expectedVrf := createTestVrf()
	data := map[string]interface{}{
		"id":                 expectedVrf.ID,
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
	if !reflect.DeepEqual(expectedVrf, receivedVrf) {
		t.Fatalf("Expected received vrf to be '%v'. Got '%v'\n", expectedVrf, receivedVrf)
	}

	var vrfs []Vrf
	a.DB.Preload("Endpoints").Find(&vrfs)
	storedVrf := vrfs[0]
	if !reflect.DeepEqual(expectedVrf, storedVrf) {
		t.Fatalf("Expected stored vrf to be '%v'. Got '%v'\n", expectedVrf, storedVrf)
	}
}

func TestGetVrf(t *testing.T) {
	clearTable()

	expectedVrf := createTestVrf()
	addVrf(t, expectedVrf)

	req, _ := http.NewRequest(http.MethodGet, vrfsPath+"/2", nil)
	req.SetBasicAuth("admin", "cisco123")
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var receivedVrf Vrf
	decoder := json.NewDecoder(response.Body)
	if err := decoder.Decode(&receivedVrf); err != nil {
		t.Fatalf("error during decode %v\n", err)
	}

	if !reflect.DeepEqual(expectedVrf, receivedVrf) {
		t.Fatalf("Expected vrf to be '%v'. Got '%v'\n", expectedVrf, receivedVrf)
	}
}

func TestUpdateVrf(t *testing.T) {
	clearTable()

	expectedVrf := createTestVrf()
	addVrf(t, expectedVrf)

	expectedVrf.ClientName = `changed name`
	expectedVrf.Vlans = []byte(`[{"vlan":1000,"lan_ip":"10"}]`)
	expectedVrf.PhysicalInterface = `changed interface name`
	expectedVrf.Endpoints = []Endpoint{}

	data := map[string]interface{}{
		"client_name":        expectedVrf.ClientName,
		"vlans":              expectedVrf.Vlans,
		"physical_interface": expectedVrf.PhysicalInterface,
		"endpoints":          expectedVrf.Endpoints,
	}
	dataJSON, _ := json.Marshal(data)

	req, _ := http.NewRequest("PUT", vrfsPath+"/2", bytes.NewBuffer(dataJSON))
	req.Header.Set("Content-Type", "application/json")
	req.SetBasicAuth("admin", "cisco123")

	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var vrfs []Vrf
	a.DB.Preload("Endpoints").Find(&vrfs)

	if !reflect.DeepEqual(expectedVrf, vrfs[0]) {
		t.Fatalf("Expected %+v got %+v", expectedVrf, vrfs[0])
	}
}

func TestVrfActivation(t *testing.T) {
	clearTable()

	testVrf := createTestVrf()
	addVrf(t, testVrf)

	mock.reset()

	req := createActivationRequest(testVrf, false)
	response := executeRequest(req)
	checkResponseCode(t, http.StatusOK, response.Code)

	if mock.genCalled != 0 {
		t.Fatalf("Expected generator to not be called, got %d", mock.genCalled)
	}
	if mock.delCalled != 1 {
		t.Fatalf("Expected delete to be called once, got %d", mock.delCalled)
	}

	mock.reset()

	req = createActivationRequest(testVrf, true)
	response = executeRequest(req)
	checkResponseCode(t, http.StatusOK, response.Code)

	if mock.genCalled != 1 {
		t.Fatalf("Expected generator to be called once, got %d", mock.genCalled)
	}
	if mock.delCalled != 0 {
		t.Fatalf("Expected delete to not be called, got %d", mock.delCalled)
	}

	mock.reset()

	req = createActivationRequest(testVrf, true)
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
	clearTable()

	testVrf := createTestVrf()
	addVrf(t, testVrf)

	req, _ := http.NewRequest(http.MethodDelete, vrfsPath+"/2", nil)
	req.SetBasicAuth("admin", "cisco123")
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var vrfs []Vrf
	if result := a.DB.Find(&vrfs); result.RowsAffected != 0 {
		t.Fatalf("Expected number of vrfs to be 0 got %v", result.RowsAffected)
	}
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

func createTestVrf() Vrf {
	active := true
	return Vrf{
		2,
		"test vrf",
		[]byte(`[{"vlan":1000,"lan_ip":"10"},{"vlan":2000,"lan_ip":"20"}]`),
		[]byte(`["aes123","sha234","modp345"]`),
		[]byte(`["camellia456","md567","frodos678"]`),
		"test interface",
		&active,
		3,
		[]Endpoint{{
			1,
			2,
			"192.168.0.1",
			"0.0.0.1",
			"10.42.0.1",
			3,
			true,
			false,
			"eth3",
			EndpointAuth{"type12", "psk23", "localcert34", "remotecert45", "privatekey56"}}}}
}

func createActivationRequest(vrf Vrf, active bool) *http.Request {
	vrf.Active = &active

	data := map[string]interface{}{
		"client_name":        vrf.ClientName,
		"vlans":              vrf.Vlans,
		"physical_interface": vrf.PhysicalInterface,
		"active":             vrf.Active,
	}
	dataJSON, _ := json.Marshal(data)

	req, _ := http.NewRequest("PUT", vrfsPath+"/2", bytes.NewBuffer(dataJSON))
	req.Header.Set("Content-Type", "application/json")
	req.SetBasicAuth("admin", "cisco123")

	return req
}

func clearTable() {
	a.DB.Where("1=1").Delete(Vrf{})
	a.DB.Where("1=1").Delete(StoredError{})
}

func addVrf(t *testing.T, vrf Vrf) {
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
