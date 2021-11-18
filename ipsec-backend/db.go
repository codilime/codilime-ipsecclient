package main

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/datatypes"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

const hardwareVrfID = 1

type EndpointAuth struct {
	Type         string `json:"type"`
	PSK          string `json:"psk"`
	LocalCert    string `json:"local_cert"`
	RemoteCert   string `json:"remote_cert"`
	PrivateKey   string `json:"private_key"`
	Pkcs12Base64 string `json:"pkcs12_base64"`
}

func (e *EndpointAuth) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return ReturnNewError(fmt.Sprint("EndpointAuth value was not []bytes:", value))
	}
	result := EndpointAuth{}
	err := json.Unmarshal(bytes, &result)
	*e = result
	return ReturnError(err)
}

func (e EndpointAuth) Value() (driver.Value, error) {
	bytes, err := json.Marshal(&e)
	if err != nil {
		return nil, ReturnError(err)
	}
	return bytes, nil
}

type Endpoint struct {
	ID              uint32       `json:"id"`
	VrfID           uint32       `json:"vrf_id"`
	RemoteIPSec     string       `json:"remote_ip_sec"`
	LocalIP         string       `json:"local_ip"`
	PeerIP          string       `json:"peer_ip"`
	RemoteAS        uint32       `json:"remote_as"`
	NAT             bool         `json:"nat"`
	BGP             bool         `json:"bgp"`
	SourceInterface string       `json:"source_interface"`
	Authentication  EndpointAuth `json:"authentication"`
}

type Vrf struct {
	ID                uint32         `json:"id"`
	ClientName        string         `json:"client_name"`
	Vlans             datatypes.JSON `json:"vlan"`
	CryptoPh1         datatypes.JSON `json:"crypto_ph1"`
	CryptoPh2         datatypes.JSON `json:"crypto_ph2"`
	PhysicalInterface string         `json:"physical_interface"`
	Active            *bool          `json:"active"` // pointer, otherwise it is impossible to set value to false
	LocalAs           uint32         `json:"local_as"`
	DisablePeerIps    *bool          `json:"disable_peer_ips"`
	Endpoints         []Endpoint     `json:"endpoint"`
}

func (v *Vrf) endpointByID(id uint32) *Endpoint {
	for _, e := range v.Endpoints {
		if e.ID == id {
			return &e
		}
	}
	return nil
}

type Vlan struct {
	Vlan  uint32 `json:"vlan"`
	LanIP string `json:"lan_ip"`
}

type Setting struct {
	ID    uint32
	Name  string
	Value string
}

func (v *Vrf) getVlans() ([]Vlan, error) {
	ret := []Vlan{}
	err := json.Unmarshal(v.Vlans, &ret)
	return ret, ReturnError(err)
}

type Masterpass struct {
	ID         uint32
	Masterpass string
}

type CertificateAuthority struct {
	ID uint32
	CA string
}

type StoredError struct {
	ID        uint32
	Message   string
	ErrorTime time.Time `json:"time"`
}

func initializeDB(dbName string) (*gorm.DB, error) {
	newLogger := logger.New(
		log.New(os.Stdout, "\n", log.LstdFlags),
		logger.Config{
			Colorful: false, // Disable color
		},
	)
	db, err := gorm.Open(sqlite.Open(dbName), &gorm.Config{
		Logger:               newLogger,
		FullSaveAssociations: true,
	})
	if err != nil {
		return nil, ReturnError(err)
	}
	if err = db.AutoMigrate(&Vrf{}); err != nil {
		return nil, ReturnError(err)
	}
	if err = db.AutoMigrate(&Setting{}); err != nil {
		return nil, ReturnError(err)
	}
	if err = db.AutoMigrate(&Endpoint{}); err != nil {
		return nil, ReturnError(err)
	}
	if err = db.AutoMigrate(&Masterpass{}); err != nil {
		return nil, ReturnError(err)
	}
	if err = db.AutoMigrate(&CertificateAuthority{}); err != nil {
		return nil, err
	}
	if err = db.AutoMigrate(&StoredError{}); err != nil {
		return nil, err
	}
	return db, nil
}

func (Vrf) TableName() string {
	return "vrfs"
}

func (v *Vrf) getVrf(db *gorm.DB) error {
	return ReturnError(db.Preload("Endpoints").First(v, v.ID).Error)
}

func (v *Vrf) updateVrf(db *gorm.DB) error {
	var e Endpoint
	return ReturnError(
		db.Updates(v).Error,
		db.Model(v).Association("Endpoints").Replace(v.Endpoints),
		db.Where("vrf_id IS NULL").Delete(&e).Error,
	)
}

func (v *Vrf) deleteVrf(db *gorm.DB) error {
	return ReturnError(db.Select("Endpoints").Delete(v).Error)
}

func (v *Vrf) createVrf(db *gorm.DB) error {
	return ReturnError(db.Create(v).Error)
}

func getVrfs(db *gorm.DB) ([]Vrf, error) {
	var vrfs []Vrf
	res := db.Preload("Endpoints").Find(&vrfs)
	return vrfs, ReturnError(res.Error)
}

func (s *Setting) getSetting(db *gorm.DB) error {
	res := db.Where("name = ?", s.Name).First(s)
	return ReturnError(res.Error)
}

func (s *Setting) createSetting(db *gorm.DB) error {
	res := db.Create(s)
	return ReturnError(res.Error)
}

func (e *StoredError) createError(db *gorm.DB) error {
	return ReturnError(db.Create(e).Error)
}

func getStoredErrors(db *gorm.DB) ([]StoredError, error) {
	var storedErrors []StoredError
	res := db.Find(&storedErrors)
	fmt.Printf("getStoredErrors: %+v\n", storedErrors)
	return storedErrors, ReturnError(res.Error)
}
