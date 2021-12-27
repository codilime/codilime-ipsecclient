package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"ipsec_backend/db"
	"ipsec_backend/logger"
	"ipsec_backend/mock"
	"net/http"
	"net/http/httptest"
	"os"
	"reflect"
	"sort"
	"strconv"
	"testing"

	"github.com/go-test/deep"
	"github.com/golang/mock/gomock"
	"github.com/jinzhu/copier"
	log "github.com/sirupsen/logrus"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

const (
	password = "cisco123"
	vrfIdSW  = 4
)

var cryptoAlgorythms = []string{"aes123", "sha234", "modp345", "camellia456", "md567", "frodos678"}

func TestMain(m *testing.M) {
	log.SetFormatter(&logger.ErrorFormatter{})
	os.Exit(m.Run())
}

func createApp(t *testing.T) (*App, *mock.MockGenerator, *mock.MockGenerator, *mock.MockDBinterface) {
	switchCreds := db.SwitchCreds{"admin", "cisco123"}

	ctrl := gomock.NewController(t)
	softwareGenerator := mock.NewMockGenerator(ctrl)
	hardwareGenerator := mock.NewMockGenerator(ctrl)
	dbInstance := mock.NewMockDBinterface(ctrl)
	dbInstance.EXPECT().SetSetting(gomock.Eq(password), gomock.Eq("switch_username"), switchCreds.Username).Return(nil)
	dbInstance.EXPECT().SetSetting(gomock.Eq(password), gomock.Eq("switch_password"), switchCreds.Password).Return(nil)
	dbInstance.EXPECT().SetSetting(gomock.Eq(password), gomock.Eq("system_name"), gomock.Any()).Return(nil)
	dbInstance.EXPECT().SetSetting(gomock.Eq(password), gomock.Eq("app_version"), gomock.Any()).Return(nil)
	dbInstance.EXPECT().Create(gomock.Any()).Return(nil)
	app, _ := NewApp(dbInstance, softwareGenerator, hardwareGenerator, switchCreds)
	return app, softwareGenerator, hardwareGenerator, dbInstance
}

func TestGetVrfs(t *testing.T) {
	app, _, _, dbInstance := createApp(t)

	expectedVrfs := []db.Vrf{createTestVrf()}
	setCryptoDB(&expectedVrfs[0], cryptoAlgorythms, t)

	dbInstance.EXPECT().GetVrfs().Return(expectedVrfs, nil)
	dbInstance.EXPECT().DecryptPSK(gomock.Eq(password), gomock.Eq(&expectedVrfs[0])).Return(nil)

	req, _ := http.NewRequest(http.MethodGet, vrfPath, nil)
	req.SetBasicAuth(username, password)
	response := executeRequest(app, req)

	checkResponseCode(t, http.StatusOK, response.Code)

	var receivedVrf struct {
		Vrf []db.Vrf `json:"vrf"`
	}
	decoder := json.NewDecoder(response.Body)
	if err := decoder.Decode(&receivedVrf); err != nil {
		t.Fatalf("error during decode %v\n", err)
	}

	setCryptoYang(&expectedVrfs[0], cryptoAlgorythms, t)

	if diff := compareVrf(expectedVrfs[0], receivedVrf.Vrf[0]); diff != nil {
		t.Fatalf("Expected vrf to be %v. Got %v. Diff %v", expectedVrfs[0], receivedVrf.Vrf[0], diff)
	}
}

func TestGetNonExistentVrf(t *testing.T) {
	app, _, _, dbInstance := createApp(t)

	expectedErrorMsg := "Vrf not found"

	dbInstance.EXPECT().GetVrf(vrfMatcher{db.Vrf{ID: vrfIdSW}}).DoAndReturn(func(vrf *db.Vrf) error {
		return gorm.ErrRecordNotFound
	})
	dbInstance.EXPECT().RotateErrorsBySizeOrDate()
	dbInstance.EXPECT().Create(gomock.Any()).DoAndReturn(func(e *db.StoredError) error {
		if e.Message != expectedErrorMsg {
			t.Fatalf("Expected error msg to be: "+expectedErrorMsg+". Got: %s", e.Message)
		}
		return nil
	})
	req, _ := http.NewRequest(http.MethodGet, vrfPath+"="+strconv.Itoa(vrfIdSW), nil)
	req.SetBasicAuth(username, password)
	response := executeRequest(app, req)

	checkResponseCode(t, http.StatusNotFound, response.Code)
}

func TestCreateVrf(t *testing.T) {
	app, softwareGenerator, _, dbInstance := createApp(t)

	const endpointId = 2
	const origin = "test-origin"
	expectedLocation := origin + "/restconf/data/sico-ipsec:api/vrf=" + strconv.Itoa(vrfIdSW)

	expectedVrf := createTestVrf()
	setCryptoYang(&expectedVrf, cryptoAlgorythms, t)

	data := map[string]interface{}{
		"vrf": map[string]interface{}{
			"client_name":        expectedVrf.ClientName,
			"vlan":               expectedVrf.Vlans,
			"crypto_ph1":         expectedVrf.CryptoPh1,
			"crypto_ph2":         expectedVrf.CryptoPh2,
			"physical_interface": expectedVrf.PhysicalInterface,
			"active":             expectedVrf.Active,
			"local_as":           expectedVrf.LocalAs,
			"disable_peer_ips":   expectedVrf.DisablePeerIps,
			"ospf":               expectedVrf.OSPF,
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
	setCryptoDB(&expectedVrf, cryptoAlgorythms, t)

	createdVrf := getCreatedVrf(expectedVrf, vrfIdSW, endpointId)

	dbInstance.EXPECT().EncryptPSK(gomock.Eq(password), vrfMatcher{expectedVrf}).Return(nil)
	dbInstance.EXPECT().Create(vrfMatcher{expectedVrf}).DoAndReturn(func(vrf *db.Vrf) error {
		*vrf = createdVrf
		return nil
	})
	dbInstance.EXPECT().DecryptPSK(gomock.Eq(password), vrfMatcher{createdVrf}).Return(nil)
	dbInstance.EXPECT().EncryptPSK(gomock.Eq(password), vrfMatcher{createdVrf}).Return(nil)
	dbInstance.EXPECT().UpdateVrf(vrfMatcher{createdVrf}).Return(nil)
	dbInstance.EXPECT().GetVrf(vrfMatcher{createdVrf}).Return(nil)
	dbInstance.EXPECT().DecryptPSK(gomock.Eq(password), vrfMatcher{createdVrf}).Return(nil)
	softwareGenerator.
		EXPECT().
		GenerateConfigs(gomock.Eq(createdVrf)).
		Return(nil)

	dataJSON, err := json.Marshal(data)
	if err != nil {
		t.Fatalf("error during encode data %v\n", err)
	}

	req, err := http.NewRequest(http.MethodPost, vrfPath, bytes.NewBuffer(dataJSON))
	if err != nil {
		t.Fatalf("error during create request %v\n", err)
	}
	req.SetBasicAuth(username, password)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Origin", origin)

	response := executeRequest(app, req)
	checkResponseCode(t, http.StatusCreated, response.Code)

	if len(response.Header()["Location"]) < 1 || response.Header()["Location"][0] != expectedLocation {
		t.Fatalf("Expected received Location to be '%s'. Got '%v'\n", expectedLocation, response.Header()["Location"])
	}
}

func TestGetVrf(t *testing.T) {
	app, _, _, dbInstance := createApp(t)

	expectedVrf := createTestVrf()
	setCryptoDB(&expectedVrf, cryptoAlgorythms, t)
	dbInstance.EXPECT().GetVrf(vrfMatcher{db.Vrf{ID: uint32(vrfIdSW)}}).DoAndReturn(func(vrf *db.Vrf) error {
		*vrf = expectedVrf
		return nil
	})
	dbInstance.EXPECT().DecryptPSK(gomock.Eq(password), vrfMatcher{expectedVrf}).Return(nil)

	req, _ := http.NewRequest(http.MethodGet, vrfPath+"="+strconv.Itoa(vrfIdSW), nil)
	req.SetBasicAuth(username, password)
	response := executeRequest(app, req)

	checkResponseCode(t, http.StatusOK, response.Code)

	setCryptoYang(&expectedVrf, cryptoAlgorythms, t)

	var receivedVrf struct {
		Vrf db.Vrf `json:"vrf"`
	}
	decoder := json.NewDecoder(response.Body)
	if err := decoder.Decode(&receivedVrf); err != nil {
		t.Fatalf("error during decode %v\n", err)
	}
	if compareVrf(expectedVrf, receivedVrf.Vrf) != nil {
		t.Fatalf("Expected vrf to be %v got %v", expectedVrf, receivedVrf.Vrf)
	}
}

func TestVlans(t *testing.T) {
	app, _, _, dbInstance := createApp(t)

	expectedErrorMsg := "vlan 1000 appears more than once, 2 times"
	testVrf := createTestVrf()

	dbInstance.EXPECT().RotateErrorsBySizeOrDate()
	dbInstance.EXPECT().Create(gomock.Any()).DoAndReturn(func(e *db.StoredError) error {
		if e.Message != expectedErrorMsg {
			t.Fatalf("Expected error msg to be: "+expectedErrorMsg+". Got: %s", e.Message)
		}
		return nil
	})
	data := map[string]interface{}{
		"vrf": map[string]interface{}{
			"client_name":        "vlans_test",
			"vlan":               datatypes.JSON(`[{"vlan":1000,"lan_ip":"11.11.0.0/30"},{"vlan":1000,"lan_ip":"22.22.0.0/30"}]`),
			"crypto_ph1":         testVrf.CryptoPh1,
			"crypto_ph2":         testVrf.CryptoPh2,
			"physical_interface": testVrf.PhysicalInterface,
			"active":             testVrf.Active,
			"local_as":           testVrf.LocalAs,
			"endpoint":           []map[string]interface{}{},
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
	req.Header.Set("Origin", "test-origin")

	response := executeRequest(app, req)
	checkResponseCode(t, http.StatusBadRequest, response.Code)
}

func _testIPv6(expectedErrorMsg string, req *http.Request, t *testing.T) {
	app, _, _, dbInstance := createApp(t)

	dbInstance.EXPECT().RotateErrorsBySizeOrDate()
	dbInstance.EXPECT().Create(gomock.Any()).DoAndReturn(func(e *db.StoredError) error {
		if e.Message != expectedErrorMsg {
			t.Fatalf("Expected error msg to be: "+expectedErrorMsg+". Got: %s", e.Message)
		}
		return nil
	})

	req.SetBasicAuth("admin", "cisco123")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Origin", "test-origin")

	response := executeRequest(app, req)
	checkResponseCode(t, http.StatusBadRequest, response.Code)
}

func _testIPv6Update(expectedErrorMsg string, endpoint map[string]interface{}, vrfId int, t *testing.T) {
	data := map[string]interface{}{
		"vrf": map[string]interface{}{
			"endpoint": []map[string]interface{}{
				endpoint,
			},
		},
	}
	dataJSON, err := json.Marshal(data)
	if err != nil {
		t.Fatalf("error during encode data %v\n", err)
	}
	req, err := http.NewRequest(http.MethodPatch, vrfPath+"="+strconv.Itoa(vrfId), bytes.NewBuffer(dataJSON))
	if err != nil {
		t.Fatalf("error during create request %v\n", err)
	}

	_testIPv6(expectedErrorMsg, req, t)
}

func _testIPv6Create(expectedErrorMsg string, endpoint map[string]interface{}, t *testing.T) {
	data := map[string]interface{}{
		"vrf": map[string]interface{}{
			"endpoint": []map[string]interface{}{
				endpoint,
			},
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

	_testIPv6(expectedErrorMsg, req, t)
}

func TestIPv6Create(t *testing.T) {
	_testIPv6Create("endpoint local ip: IPv6 not supported", map[string]interface{}{
		"local_ip": "2001:db8::",
	}, t)

	_testIPv6Create("endpoint peer ip: IPv6 not supported", map[string]interface{}{
		"peer_ip": "2001:db8::",
	}, t)
}

func TestIPv6Update(t *testing.T) {
	_testIPv6Update("endpoint local ip: IPv6 not supported", map[string]interface{}{
		"local_ip": "2001:db8::",
	}, vrfIdSW, t)

	_testIPv6Update("endpoint peer ip: IPv6 not supported", map[string]interface{}{
		"peer_ip": "2001:db8::",
	}, vrfIdSW, t)

	_testIPv6Update("endpoint local ip: IPv6 not supported", map[string]interface{}{
		"local_ip": "2001:db8::",
	}, db.HardwareVrfID, t)

	_testIPv6Update("endpoint peer ip: IPv6 not supported", map[string]interface{}{
		"peer_ip": "2001:db8::",
	}, db.HardwareVrfID, t)
}

func executeUpdate(oldActive, newActive bool, t *testing.T) (*App, *http.Request, *mock.MockGenerator, db.Vrf) {
	expectedVrf := createTestVrf()
	expectedVrf.Active = db.BoolPointer(&newActive)
	app, softwareGenerator, _, dbInstance := createApp(t)
	setCryptoYang(&expectedVrf, cryptoAlgorythms, t)
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
			"disable_peer_ips":   expectedVrf.DisablePeerIps,
			"ospf":               expectedVrf.OSPF,
		},
	}
	dataJSON, _ := json.Marshal(data)

	setCryptoDB(&expectedVrf, cryptoAlgorythms, t)
	expectedVrf.ID = vrfId
	dbInstance.EXPECT().GetVrf(gomock.Any()).DoAndReturn(func(vrf *db.Vrf) error {
		vrf.Active = db.BoolPointer(&oldActive)
		return nil
	})
	dbInstance.EXPECT().EncryptPSK(gomock.Eq(password), vrfMatcher{expectedVrf}).Return(nil)
	dbInstance.EXPECT().UpdateVrf(vrfMatcher{expectedVrf}).Return(nil)
	dbInstance.EXPECT().GetVrf(vrfMatcher{expectedVrf}).Return(nil)
	dbInstance.EXPECT().DecryptPSK(gomock.Eq(password), vrfMatcher{expectedVrf}).Return(nil)

	req, _ := http.NewRequest("PATCH", vrfPath+"="+strconv.Itoa(vrfId), bytes.NewBuffer(dataJSON))
	req.Header.Set("Content-Type", "application/json")
	req.SetBasicAuth(username, password)
	return app, req, softwareGenerator, expectedVrf
}

func TestUpdateVrf(t *testing.T) {
	app, req, softwareGenerator, _ := executeUpdate(true, false, t)
	softwareGenerator.EXPECT().DeleteConfigs(gomock.Any()).Return(nil)
	response := executeRequest(app, req)
	checkResponseCode(t, http.StatusNoContent, response.Code)

	app, req, softwareGenerator, expectedVrf := executeUpdate(false, true, t)
	softwareGenerator.EXPECT().GenerateConfigs(vrfMatcher{expectedVrf}).Return(nil)
	response = executeRequest(app, req)
	checkResponseCode(t, http.StatusNoContent, response.Code)

	app, req, softwareGenerator, expectedVrf = executeUpdate(true, true, t)
	softwareGenerator.EXPECT().DeleteConfigs(gomock.Any()).Return(nil)
	softwareGenerator.EXPECT().GenerateConfigs(vrfMatcher{expectedVrf}).Return(nil)
	response = executeRequest(app, req)
	checkResponseCode(t, http.StatusNoContent, response.Code)
}

func setCryptoDB(vrf *db.Vrf, cryptoAlgs []string, t *testing.T) {
	if len(cryptoAlgs) < 6 {
		t.Fatalf("Wrong number of algorithms expected at least 6 got %d\n", len(cryptoAlgs))
	}
	vrf.CryptoPh1 = []byte(fmt.Sprintf(`["%s","%s","%s"]`, cryptoAlgs[0], cryptoAlgs[1], cryptoAlgs[2]))
	vrf.CryptoPh2 = []byte(fmt.Sprintf(`["%s","%s","%s"]`, cryptoAlgs[3], cryptoAlgs[4], cryptoAlgs[5]))
}

func setCryptoYang(vrf *db.Vrf, cryptoAlgs []string, t *testing.T) {
	if len(cryptoAlgs) < 6 {
		t.Fatalf("Wrong number of algorithms expected at least 6 got %d\n", len(cryptoAlgs))
	}
	vrf.CryptoPh1 = []byte(fmt.Sprintf(`"%s.%s.%s"`, cryptoAlgs[0], cryptoAlgs[1], cryptoAlgs[2]))
	vrf.CryptoPh2 = []byte(fmt.Sprintf(`"%s.%s.%s"`, cryptoAlgs[3], cryptoAlgs[4], cryptoAlgs[5]))
}

type vrfMatcher struct {
	vrf db.Vrf
}

func (v vrfMatcher) Matches(vrfInt interface{}) bool {
	vrf, ok := vrfInt.(db.Vrf)
	if ok {
		diff := compareVrf(vrf, v.vrf)
		if diff != nil {
			fmt.Printf("diff: %v\n", diff)
			return false
		}
		return true
	}
	vrfPtr, ok := vrfInt.(*db.Vrf)
	if ok {
		diff := compareVrf(*vrfPtr, v.vrf)
		if diff != nil {
			fmt.Printf("diff: %v\n", diff)
			return false
		}
		return true
	}
	return false
}

func (v vrfMatcher) String() string {
	return fmt.Sprintf("%v", v.vrf)
}

func compareVrf(lhVrf, rhVrf db.Vrf) []string {
	if diff := compareVlans(lhVrf, rhVrf); diff != nil {
		return diff
	}
	lhVrf.Vlans = []byte{}
	rhVrf.Vlans = []byte{}
	return deep.Equal(lhVrf, rhVrf)
}

func compareVlans(expectedVrf, receivedVrf db.Vrf) []string {
	if reflect.DeepEqual(expectedVrf.Vlans, receivedVrf.Vlans) {
		return nil
	}
	receivedVlans := []db.Vlan{}
	if err := json.Unmarshal(receivedVrf.Vlans, &receivedVlans); err != nil {
		return []string{fmt.Sprintf("checkVlansBool error during unmarshal %v", err)}
	}
	sort.SliceStable(receivedVlans, func(i, j int) bool {
		return receivedVlans[i].Vlan < receivedVlans[j].Vlan
	})
	expectedVlans := []db.Vlan{}
	if err := json.Unmarshal(expectedVrf.Vlans, &expectedVlans); err != nil {
		return []string{fmt.Sprintf("checkVlansBool error during unmarshal %v", err)}
	}
	sort.SliceStable(expectedVlans, func(i, j int) bool {
		return expectedVlans[i].Vlan < expectedVlans[j].Vlan
	})
	if diff := deep.Equal(receivedVlans, expectedVlans); diff != nil {
		return []string{fmt.Sprintf("checkVlansBool Expected vlans to be '%+v'. Got '%+v'. Diff %+v\n", receivedVlans, expectedVlans, diff)}
	}
	return nil
}

func createTestVrf() db.Vrf {
	active := true
	disablePeerIps := false
	ospf := false
	return db.Vrf{
		0,
		"test vrf",
		datatypes.JSON(`[{"vlan":1000,"lan_ip":"11.11.0.0/30"},{"vlan":2000,"lan_ip":"22.22.0.0/30"}]`),
		datatypes.JSON(`"aes128.sha256.modp1536"`),
		datatypes.JSON(`"aes128.sha256.modp1536"`),
		"test_interface",
		&active,
		3,
		&disablePeerIps,
		&ospf,
		[]db.Endpoint{{
			0,
			0,
			"192.168.0.1",
			"0.0.0.1",
			"10.42.0.1",
			3,
			true,
			false,
			"eth3",
			db.EndpointAuth{"psk", "psk23", "test@codilime.com", "", "", "", ""}}}}
}

func getCreatedVrf(vrf db.Vrf, vrfId, endpointId int) db.Vrf {
	var createdVrf db.Vrf
	copier.CopyWithOption(&createdVrf, &vrf, copier.Option{DeepCopy: true})
	createdVrf.ID = uint32(vrfId)
	createdVrf.Endpoints[0].ID = uint32(endpointId)
	createdVrf.Endpoints[0].VrfID = uint32(vrfId)
	return createdVrf
}

func executeRequest(app *App, req *http.Request) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	app.router.ServeHTTP(rr, req)

	return rr
}

func checkResponseCode(t *testing.T, expected, actual int) {
	if expected != actual {
		t.Fatalf("Expected response code %d. Got %d\n", expected, actual)
	}
}
