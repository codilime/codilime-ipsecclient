package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"reflect"
	"strings"
	"testing"
	"unicode"

	log "github.com/sirupsen/logrus"
)

const decryptedPsk = "psk23"
const encryptedPsk = "UrO4Jx0D6USzyds2yFMd/VdIczYc4/oxFPbPTl2jQOv4"

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
	log.SetFormatter(&ErrorFormatter{})
	dbName := "file::memory:?cache=shared"
	a.Initialize(dbName)
	mock = MockGenerator{}
	a.Generator = &mock
	code := m.Run()
	os.Exit(code)
}

func removeWhitespace(str string) string {
	return strings.Map(func(r rune) rune {
		if unicode.IsSpace(r) {
			return -1
		}
		return r
	}, str)
}

func TestEmptyTable(t *testing.T) {
	clearTable()

	req, _ := http.NewRequest(http.MethodGet, vrfPath, nil)
	req.SetBasicAuth("admin", "cisco123")
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	if body := response.Body.String(); removeWhitespace(body) != `{"vrf":[]}` {
		t.Fatalf("Expected an empty YANG list. Got %s", body)
	}
}

func TestGetNonExistentVrf(t *testing.T) {
	clearTable()

	req, _ := http.NewRequest(http.MethodGet, vrfPath+"=42", nil)
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

func MarshalCryptoPh1(vrf Vrf) string {
	cryptos := []string{}
	json.Unmarshal(vrf.CryptoPh1, &cryptos)
	return `"` + strings.Join(cryptos, ".") + `"`
}

func MarshalCryptoPh2(vrf Vrf) string {
	cryptos := []string{}
	json.Unmarshal(vrf.CryptoPh2, &cryptos)
	return `"` + strings.Join(cryptos, ".") + `"`
}

func TestCreateVrf(t *testing.T) {
	clearTable()

	expectedVrf := createTestVrf()
	data := map[string]interface{}{
		"vrf": map[string]interface{}{
			"id":                 expectedVrf.ID,
			"client_name":        expectedVrf.ClientName,
			"vlan":               expectedVrf.Vlans,
			"crypto_ph1":         expectedVrf.CryptoPh1,
			"crypto_ph2":         expectedVrf.CryptoPh2,
			"physical_interface": expectedVrf.PhysicalInterface,
			"active":             expectedVrf.Active,
			"local_as":           expectedVrf.LocalAs,
			"endpoint":           expectedVrf.Endpoints,
		},
	}
	dataJSON, err := json.Marshal(data)
	if err != nil {
		t.Fatalf("error during encode data %v\n", err)
	}

	req, err := http.NewRequest(http.MethodPost, vrfPath, bytes.NewBuffer(dataJSON))
	if err != nil {
		t.Fatalf("error during create request %v\n", err)
	}
	req.SetBasicAuth("admin", "cisco123")
	req.Header.Set("Content-Type", "application/json")

	response := executeRequest(req)
	checkResponseCode(t, http.StatusCreated, response.Code)

	var vrfs []Vrf
	a.DB.Preload("Endpoints").Find(&vrfs)
	storedVrf := vrfs[0]
	storedVrf.Endpoints[0].Authentication.PSK = ""
	expectedVrf.Endpoints[0].Authentication.PSK = ""

	storedVrf.CryptoPh1 = []byte(MarshalCryptoPh1(storedVrf))
	storedVrf.CryptoPh2 = []byte(MarshalCryptoPh2(storedVrf))

	if !reflect.DeepEqual(expectedVrf, storedVrf) {
		t.Fatalf("Expected stored vrf to be '%v'. Got '%v'\n", expectedVrf, storedVrf)
	}
}

func TestGetVrf(t *testing.T) {
	clearTable()
	var cryptoAlgorythms = []string{"aes123", "sha234", "modp345", "camellia456", "md567", "frodos678"}

	expectedVrf := createTestVrf()
	expectedVrf.Endpoints[0].Authentication.PSK = encryptedPsk
	setCryptoDB(&expectedVrf, cryptoAlgorythms, t)
	addVrfToDB(t, expectedVrf)

	req, _ := http.NewRequest(http.MethodGet, vrfPath+"=2", nil)
	req.SetBasicAuth("admin", "cisco123")
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	expectedVrf.Endpoints[0].Authentication.PSK = decryptedPsk
	setCryptoYang(&expectedVrf, cryptoAlgorythms, t)

	var receivedVrf struct {
		Vrf Vrf `json:"vrf"`
	}
	decoder := json.NewDecoder(response.Body)
	if err := decoder.Decode(&receivedVrf); err != nil {
		t.Fatalf("error during decode %v\n", err)
	}

	checkVlans(expectedVrf, receivedVrf.Vrf, t)
	expectedVrf.Vlans = []byte{}
	receivedVrf.Vrf.Vlans = []byte{}

	if !reflect.DeepEqual(expectedVrf, receivedVrf.Vrf) {
		t.Fatalf("Expected vrf to be '%v'. Got '%v'\n", expectedVrf, receivedVrf.Vrf)
	}
}

func TestUpdateVrf(t *testing.T) {
	clearTable()
	var cryptoAlgorythms = []string{"aes123", "sha234", "modp345", "camellia456", "md567", "frodos678"}

	expectedVrf := createTestVrf()
	expectedVrf.Endpoints[0].Authentication.PSK = encryptedPsk
	setCryptoDB(&expectedVrf, cryptoAlgorythms, t)
	addVrfToDB(t, expectedVrf)

	setCryptoYang(&expectedVrf, cryptoAlgorythms, t)
	expectedVrf.ClientName = `changed name`
	expectedVrf.Vlans = []byte(`[{"vlan":1000,"lan_ip":"10"}]`)
	expectedVrf.PhysicalInterface = `changed interface name`
	expectedVrf.Endpoints = []Endpoint{}

	data := map[string]interface{}{
		"vrf": map[string]interface{}{
			"id":                 expectedVrf.ID,
			"client_name":        expectedVrf.ClientName,
			"vlan":               expectedVrf.Vlans,
			"crypto_ph1":         expectedVrf.CryptoPh1,
			"crypto_ph2":         expectedVrf.CryptoPh2,
			"physical_interface": expectedVrf.PhysicalInterface,
			"active":             expectedVrf.Active,
			"local_as":           expectedVrf.LocalAs,
			"endpoint":           expectedVrf.Endpoints,
		},
	}
	dataJSON, _ := json.Marshal(data)

	req, _ := http.NewRequest("PATCH", vrfPath+"=2", bytes.NewBuffer(dataJSON))
	req.Header.Set("Content-Type", "application/json")
	req.SetBasicAuth("admin", "cisco123")

	response := executeRequest(req)

	checkResponseCode(t, http.StatusNoContent, response.Code)

	setCryptoDB(&expectedVrf, cryptoAlgorythms, t)

	var vrfs []Vrf
	a.DB.Preload("Endpoints").Find(&vrfs)

	if !reflect.DeepEqual(expectedVrf, vrfs[0]) {
		t.Fatalf("Expected %+v got %+v", expectedVrf, vrfs[0])
	}
}

func TestVrfActivation(t *testing.T) {
	clearTable()

	testVrf := createTestVrf()
	addVrfToDB(t, testVrf)

	mock.reset()

	req := createActivationRequest(testVrf, false)
	response := executeRequest(req)
	checkResponseCode(t, http.StatusNoContent, response.Code)

	if mock.genCalled != 0 {
		t.Fatalf("Expected generator to not be called, got %d", mock.genCalled)
	}
	if mock.delCalled != 1 {
		t.Fatalf("Expected delete to be called once, got %d", mock.delCalled)
	}

	mock.reset()

	req = createActivationRequest(testVrf, true)
	response = executeRequest(req)
	checkResponseCode(t, http.StatusNoContent, response.Code)

	if mock.genCalled != 1 {
		t.Fatalf("Expected generator to be called once, got %d", mock.genCalled)
	}
	if mock.delCalled != 0 {
		t.Fatalf("Expected delete to not be called, got %d", mock.delCalled)
	}

	mock.reset()

	req = createActivationRequest(testVrf, true)
	response = executeRequest(req)
	checkResponseCode(t, http.StatusNoContent, response.Code)

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
	addVrfToDB(t, testVrf)

	req, _ := http.NewRequest(http.MethodDelete, vrfPath+"=2", nil)
	req.SetBasicAuth("admin", "cisco123")
	response := executeRequest(req)

	checkResponseCode(t, http.StatusNoContent, response.Code)

	var vrfs []Vrf
	if result := a.DB.Find(&vrfs); result.RowsAffected != 0 {
		t.Fatalf("Expected number of vrfs to be 0 got %v", result.RowsAffected)
	}
}

func TestErrorDatabase(t *testing.T) {
	clearTable()
	expectedErrorMessage := "no basic auth"
	expectedNumberOfErrors := 1

	req, err := http.NewRequest(http.MethodGet, vrfPath, nil)
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

func setCryptoDB(vrf *Vrf, cryptoAlgs []string, t *testing.T) {
	if len(cryptoAlgs) < 6 {
		t.Fatalf("Wrong number of algorithms expected at least 6 got %d\n", len(cryptoAlgs))
	}
	vrf.CryptoPh1 = []byte(fmt.Sprintf(`["%s","%s","%s"]`, cryptoAlgs[0], cryptoAlgs[1], cryptoAlgs[2]))
	vrf.CryptoPh2 = []byte(fmt.Sprintf(`["%s","%s","%s"]`, cryptoAlgs[3], cryptoAlgs[4], cryptoAlgs[5]))
}

func setCryptoYang(vrf *Vrf, cryptoAlgs []string, t *testing.T) {
	if len(cryptoAlgs) < 6 {
		t.Fatalf("Wrong number of algorithms expected at least 6 got %d\n", len(cryptoAlgs))
	}
	vrf.CryptoPh1 = []byte(fmt.Sprintf(`"%s.%s.%s"`, cryptoAlgs[0], cryptoAlgs[1], cryptoAlgs[2]))
	vrf.CryptoPh2 = []byte(fmt.Sprintf(`"%s.%s.%s"`, cryptoAlgs[3], cryptoAlgs[4], cryptoAlgs[5]))
}

func checkVlans(expectedVrf, receivedVrf Vrf, t *testing.T) {
	var receivedVlans []map[string]interface{}
	if err := json.Unmarshal(receivedVrf.Vlans, &receivedVlans); err != nil {
		t.Fatalf("error during unmarshal %v", err)
	}
	var expectedVlans []map[string]interface{}
	if err := json.Unmarshal(expectedVrf.Vlans, &expectedVlans); err != nil {
		t.Fatalf("error during unmarshal %v", err)
	}
	if !reflect.DeepEqual(receivedVlans, expectedVlans) {
		t.Fatalf("Expected vlans of vrf to be '%v'. Got '%v'\n", createTestVrf().Vlans, receivedVrf.Vlans)
	}
}

func createTestVrf() Vrf {
	active := true
	return Vrf{
		2,
		"test vrf",
		[]byte(`[{"vlan":1000,"lan_ip":"11.11.0.0/30"},{"vlan":2000,"lan_ip":"22.22.0.0/30"}]`),
		[]byte(`"aes128.sha256.modp1536"`),
		[]byte(`"aes128.sha256.modp1536"`),
		"test_interface",
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
			EndpointAuth{"psk", "psk23", "", "", "", ""}}}}
}

func createActivationRequest(vrf Vrf, active bool) *http.Request {
	vrf.Active = &active

	data := map[string]interface{}{
		"vrf": map[string]interface{}{
			"id":                 vrf.ID,
			"client_name":        vrf.ClientName,
			"vlan":               vrf.Vlans,
			"crypto_ph1":         vrf.CryptoPh1,
			"crypto_ph2":         vrf.CryptoPh2,
			"physical_interface": vrf.PhysicalInterface,
			"active":             vrf.Active,
			"local_as":           vrf.LocalAs,
			"endpoint":           vrf.Endpoints,
		},
	}
	dataJSON, _ := json.Marshal(data)

	req, _ := http.NewRequest("PATCH", vrfPath+"=2", bytes.NewBuffer(dataJSON))
	req.Header.Set("Content-Type", "application/json")
	req.SetBasicAuth("admin", "cisco123")

	return req
}

func clearTable() {
	a.DB.Where("1=1").Delete(Vrf{})
	a.DB.Where("1=1").Delete(StoredError{})
}

func addVrfToDB(t *testing.T, vrf Vrf) {
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
