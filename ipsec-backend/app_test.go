package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"os"
	"reflect"
	"strings"
	"testing"
	"unicode"

	"github.com/go-test/deep"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

const decryptedPsk = "psk23"
const encryptedPsk = "UrO4Jx0D6USzyds2yFMd/VdIczYc4/oxFPbPTl2jQOv4"

var a App
var mockGenerator MockGenerator
var mockErrorsRotationHandler MockErrorsRotationHandler

type MockGenerator struct {
	genCalled int
	delCalled int
}

func (m *MockGenerator) GenerateConfigs(v Vrf) error {
	m.genCalled++
	return nil
}

func (m *MockGenerator) DeleteConfigs(v Vrf) error {
	m.delCalled++
	return nil
}

func (m *MockGenerator) reset() {
	m.delCalled = 0
	m.genCalled = 0
}

type MockErrorsRotationHandler struct {
	byDateCalled       int
	bySizeOrDateCalled int
}

func (m *MockErrorsRotationHandler) rotateByDate(db *gorm.DB) {
	m.byDateCalled++
}

func (m *MockErrorsRotationHandler) rotateBySizeOrDate(db *gorm.DB) {
	m.bySizeOrDateCalled++
}

func (m *MockErrorsRotationHandler) reset() {
	m.byDateCalled = 0
	m.bySizeOrDateCalled = 0
}

func TestMain(m *testing.M) {
	DBError, _ = initializeDB("file::memory:?cache=shared")

	log.SetFormatter(&ErrorFormatter{})
	dbName := "file::memory:?cache=shared"
	a.Initialize(dbName)
	mockGenerator = MockGenerator{}
	a.Generator = &mockGenerator
	mockErrorsRotationHandler = MockErrorsRotationHandler{}
	a.errorsRotationHandler = &mockErrorsRotationHandler
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
	expectedBody := `{"vrf":[{"active":false,"client_name":"hardware","crypto_ph1":"aes-cbc-128.sha256.fourteen","crypto_ph2":"esp-aes.esp-sha-hmac.group14","endpoint":[],"id":1,"local_as":0,"physical_interface":"","vlan":[]}]}`

	req, _ := http.NewRequest(http.MethodGet, vrfPath, nil)
	req.SetBasicAuth("admin", "cisco123")
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)

	if body := response.Body.String(); removeWhitespace(body) != expectedBody {
		t.Fatalf("Expected HW vrf: %s. Got %s", expectedBody, removeWhitespace(body))
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
	const origin = "test-origin"
	const expectedLocation = origin + "/restconf/data/sico-ipsec:api/vrf=2"

	expectedVrf := createTestVrf()
	data := map[string]interface{}{
		"vrf": map[string]interface{}{
			"client_name":        expectedVrf.ClientName,
			"vlan":               expectedVrf.Vlans,
			"crypto_ph1":         expectedVrf.CryptoPh1,
			"crypto_ph2":         expectedVrf.CryptoPh2,
			"physical_interface": expectedVrf.PhysicalInterface,
			"active":             expectedVrf.Active,
			"local_as":           expectedVrf.LocalAs,
			"endpoint": []map[string]interface{}{{
				"remote_ip_sec":    expectedVrf.Endpoints[0].RemoteIPSec,
				"local_ip":         expectedVrf.Endpoints[0].LocalIP,
				"peer_ip":          expectedVrf.Endpoints[0].PeerIP,
				"remote_as":        expectedVrf.Endpoints[0].RemoteAS,
				"nat":              expectedVrf.Endpoints[0].NAT,
				"bgp":              expectedVrf.Endpoints[0].BGP,
				"source_interface": expectedVrf.Endpoints[0].SourceInterface,
				"authentication":   expectedVrf.Endpoints[0].Authentication,
			}},
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
	req.Header.Set("Origin", origin)

	response := executeRequest(req)
	checkResponseCode(t, http.StatusCreated, response.Code)

	if len(response.Header()["Location"]) < 1 || response.Header()["Location"][0] != expectedLocation {
		t.Fatalf("Expected received Location to be '%s'. Got '%v'\n", expectedLocation, response.Header()["Location"])
	}

	var vrfs []Vrf
	a.DB.Preload("Endpoints").Find(&vrfs)

	storedVrf := vrfs[1]
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

	compare(expectedVrf, receivedVrf.Vrf, "vrf", t)
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

	compare(expectedVrf, vrfs[1], "vrf", t)
}

func TestVrfActivation(t *testing.T) {
	clearTable()

	testVrf := createTestVrf()
	addVrfToDB(t, testVrf)

	mockGenerator.reset()

	req := createActivationRequest(testVrf, false)
	response := executeRequest(req)
	checkResponseCode(t, http.StatusNoContent, response.Code)

	if mockGenerator.genCalled != 0 {
		t.Fatalf("Expected generator to not be called, got %d", mockGenerator.genCalled)
	}
	if mockGenerator.delCalled != 1 {
		t.Fatalf("Expected delete to be called once, got %d", mockGenerator.delCalled)
	}

	mockGenerator.reset()

	req = createActivationRequest(testVrf, true)
	response = executeRequest(req)
	checkResponseCode(t, http.StatusNoContent, response.Code)

	if mockGenerator.genCalled != 1 {
		t.Fatalf("Expected generator to be called once, got %d", mockGenerator.genCalled)
	}
	if mockGenerator.delCalled != 0 {
		t.Fatalf("Expected delete to not be called, got %d", mockGenerator.delCalled)
	}

	mockGenerator.reset()

	req = createActivationRequest(testVrf, true)
	response = executeRequest(req)
	checkResponseCode(t, http.StatusNoContent, response.Code)

	if mockGenerator.genCalled != 1 {
		t.Fatalf("Expected generator to be called once, got %d", mockGenerator.genCalled)
	}
	if mockGenerator.delCalled != 1 {
		t.Fatalf("Expected delete to be called once, got %d", mockGenerator.delCalled)
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
	if result := a.DB.Find(&vrfs); result.RowsAffected != 1 {
		t.Fatalf("Expected number of vrfs to be 1 got %v", result.RowsAffected)
	}
}

func TestErrorDatabase(t *testing.T) {
	clearTable()
	mockErrorsRotationHandler.reset()
	expectedNumberOfErrors := 1
	expectedErrorMessage := "no basic auth"

	req, err := http.NewRequest(http.MethodGet, vrfPath, nil)
	if err != nil {
		t.Fatalf("error during create request %v\n", err)
	}
	response := executeRequest(req)
	checkResponseCode(t, http.StatusUnauthorized, response.Code)
	compare(mockErrorsRotationHandler.bySizeOrDateCalled, 1, "mock", t)
	compare(mockErrorsRotationHandler.byDateCalled, 0, "mock", t)
	mockErrorsRotationHandler.reset()

	req, err = http.NewRequest(http.MethodGet, errorPath, nil)
	req.SetBasicAuth("admin", "cisco123")
	if err != nil {
		t.Fatalf("error during create request %v\n", err)
	}
	response = executeRequest(req)
	checkResponseCode(t, http.StatusOK, response.Code)
	compare(mockErrorsRotationHandler.bySizeOrDateCalled, 0, "mock", t)
	compare(mockErrorsRotationHandler.byDateCalled, 1, "mock", t)

	body, _ := ioutil.ReadAll(response.Body)

	var receivedErrorsJson map[string]interface{}
	if err := json.Unmarshal(body, &receivedErrorsJson); err != nil {
		t.Fatalf("error during unmarshal %v", err)
	}
	receivedErrors := receivedErrorsJson["error"].([]interface{})
	compare(expectedNumberOfErrors, len(receivedErrors), "number of errors", t)
	compare(expectedErrorMessage, receivedErrors[0].(map[string]interface{})["message"], "error message", t)

	var databaseErrors []StoredError
	a.DB.Find(&databaseErrors)
	compare(expectedNumberOfErrors, len(databaseErrors), "number of errors", t)
	compare(expectedErrorMessage, databaseErrors[0].Message, "error message", t)
}

func compare(a, b interface{}, errorMessage string, t *testing.T) {
	if diff := deep.Equal(a, b); diff != nil {
		t.Fatalf("Expected "+errorMessage+" to be '%+v'. Got '%+v'. Diff %+v\n", a, b, diff)
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
	compare(expectedVlans, receivedVlans, "vlans of vrf", t)
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
	a.DB.Where("id != 1").Delete(Vrf{})
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
