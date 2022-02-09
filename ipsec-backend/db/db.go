/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package db

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"strings"

	"log"
	"os"
	"strconv"
	"time"

	"ipsec_backend/logger"

	"github.com/lib/pq"
	logrus "github.com/sirupsen/logrus"
	"gorm.io/datatypes"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	gorm_logger "gorm.io/gorm/logger"
)

const (
	HardwareVrfID             = 1
	DefaultErrorsRotationDays = 7
)

//go:generate mockgen -source=db.go -destination=../mock/db_mock.go -package mock
type DBinterface interface {
	Create(value interface{}) error
	GetVrf(v *Vrf) error
	UpdateVrf(v *Vrf) error
	DeleteVrf(v *Vrf) error
	GetVrfs() ([]Vrf, error)
	SetSetting(pass, name, value string) error
	GetSetting(pass, name string) (string, error)
	GetStoredErrors() ([]StoredError, error)
	GetCAs() ([]CertificateAuthority, error)
	DeleteCAs() error
	EncryptPSK(key string, v *Vrf) error
	DecryptPSK(key string, v *Vrf) error
	ChangePassword(oldPass, newPass string) error
	RotateErrorsBySizeOrDate()
	GetAlgorithms(algorithms *Algorithm) error
}

type DB struct {
	gormDb             *gorm.DB
	errorsRotationDays int
	errorsRotationSize *int // Size in Bytes
}

type EndpointAuth struct {
	Type         string `json:"type"`
	PSK          string `json:"psk"`
	LocalID      string `json:"local_id"`
	LocalCert    string `json:"local_cert"`
	RemoteCert   string `json:"remote_cert"`
	PrivateKey   string `json:"private_key"`
	Pkcs12Base64 string `json:"pkcs12_base64"`
}

func (e *EndpointAuth) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return logger.ReturnNewError(fmt.Sprint("EndpointAuth value was not []bytes:", value))
	}
	result := EndpointAuth{}
	err := json.Unmarshal(bytes, &result)
	*e = result
	return logger.ReturnError(err)
}

func (e EndpointAuth) Value() (driver.Value, error) {
	bytes, err := json.Marshal(&e)
	if err != nil {
		return nil, logger.ReturnError(err)
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

func (e *Endpoint) IsIpv6() bool {
	return strings.Contains(e.LocalIP, ":") && strings.Contains(e.PeerIP, ":")
}

func (e *Endpoint) IsPSK() string {
	if e.Authentication.Type == "psk" {
		return "psk"
	}
	return ""
}

func (e *Endpoint) IsCerts() string {
	if e.Authentication.Type == "certs" {
		return "certs"
	}
	return ""
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
	OSPF              *bool          `json:"ospf"`
	Endpoints         []Endpoint     `json:"endpoint"`
}

func (v *Vrf) EndpointByID(id uint32) *Endpoint {
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

func (v *Vrf) GetVlans() ([]Vlan, error) {
	ret := []Vlan{}
	err := json.Unmarshal(v.Vlans, &ret)
	return ret, logger.ReturnError(err)
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

type Algorithm struct {
	ID                uint32
	Phase1Encryption  pq.StringArray `gorm:"type:string[]"`
	Phase1Integrity   pq.StringArray `gorm:"type:string[]"`
	Phase1KeyExchange pq.StringArray `gorm:"type:string[]"`
	Phase2Encryption  pq.StringArray `gorm:"type:string[]"`
	Phase2Integrity   pq.StringArray `gorm:"type:string[]"`
	Phase2KeyExchange pq.StringArray `gorm:"type:string[]"`
}

func MakeDB(dbName, errRotDaysStr, errRotSizeStr string) (*DB, error) {
	db := new(DB)

	if errRotDaysStr == "" {
		db.errorsRotationDays = DefaultErrorsRotationDays
	} else {
		errRotDaysInt, err := strconv.Atoi(errRotDaysStr)
		if err != nil {
			db.errorsRotationDays = DefaultErrorsRotationDays
		} else {
			db.errorsRotationDays = errRotDaysInt
		}
	}

	if errRotSizeStr == "" {
		db.errorsRotationSize = nil
	} else {
		errRotSizeInt, err := sizeStrToInt(errRotSizeStr)
		if err != nil {
			db.errorsRotationSize = nil
		} else {
			db.errorsRotationSize = new(int)
			*db.errorsRotationSize = errRotSizeInt
		}
	}

	newLogger := gorm_logger.New(
		log.New(os.Stdout, "\n", log.LstdFlags),
		gorm_logger.Config{
			Colorful: false, // Disable color
		},
	)
	gormDb, err := gorm.Open(sqlite.Open(dbName), &gorm.Config{
		Logger:               newLogger,
		FullSaveAssociations: true,
	})
	if err != nil {
		return db, logger.ReturnError(err)
	}
	if err = gormDb.AutoMigrate(&Vrf{}); err != nil {
		return db, logger.ReturnError(err)
	}
	if err = gormDb.AutoMigrate(&Setting{}); err != nil {
		return db, logger.ReturnError(err)
	}
	if err = gormDb.AutoMigrate(&Endpoint{}); err != nil {
		return db, logger.ReturnError(err)
	}
	if err = gormDb.AutoMigrate(&Masterpass{}); err != nil {
		return db, logger.ReturnError(err)
	}
	if err = gormDb.AutoMigrate(&CertificateAuthority{}); err != nil {
		return db, logger.ReturnError(err)
	}
	if err = gormDb.AutoMigrate(&StoredError{}); err != nil {
		return db, logger.ReturnError(err)
	}
	if err = gormDb.AutoMigrate(&Algorithm{}); err != nil {
		return db, logger.ReturnError(err)
	}

	db.gormDb = gormDb
	return db, nil
}

func (Vrf) TableName() string {
	return "vrfs"
}

func (db *DB) GetVrf(v *Vrf) error {
	return logger.ReturnError(db.gormDb.Preload("Endpoints").First(v, v.ID).Error)
}

func (db *DB) UpdateVrf(v *Vrf) error {
	var e Endpoint
	return logger.ReturnError(
		db.gormDb.Updates(v).Error,
		db.gormDb.Model(v).Association("Endpoints").Replace(v.Endpoints),
		db.gormDb.Where("vrf_id IS NULL").Delete(&e).Error,
	)
}

func (db *DB) DeleteVrf(v *Vrf) error {
	return logger.ReturnError(db.gormDb.Select("Endpoints").Delete(v).Error)
}

func (db *DB) Create(value interface{}) error {
	return logger.ReturnError(db.gormDb.Create(value).Error)
}

func (db *DB) GetVrfs() ([]Vrf, error) {
	var vrfs []Vrf
	res := db.gormDb.Preload("Endpoints").Find(&vrfs)
	return vrfs, logger.ReturnError(res.Error)
}

func (db *DB) getSetting(s *Setting) error {
	return logger.ReturnError(db.gormDb.Where("name = ?", s.Name).First(s).Error)
}

func (db *DB) containsSetting(s *Setting) (bool, error) {
	res := db.gormDb.Where("name = ?", s.Name).First(s)
	if res.Error != nil {
		if res.Error == gorm.ErrRecordNotFound {
			return false, nil
		}
		return false, logger.ReturnError(res.Error)
	}
	return true, nil
}

func (db *DB) UpdateSetting(s *Setting) error {
	return logger.ReturnError(db.gormDb.Save(&s).Error)
}

func (db *DB) GetStoredErrors() ([]StoredError, error) {
	db.rotateErrorsByDate()

	var storedErrors []StoredError
	return storedErrors, logger.ReturnError(db.gormDb.Find(&storedErrors).Error)
}

func (db *DB) DeleteMasterpass() error {
	return db.gormDb.Where("1 = 1").Delete(&Masterpass{}).Error
}

func (db *DB) containsMasterpass() (bool, error) {
	res := db.gormDb.First(&Masterpass{})
	if res.Error != nil {
		if res.Error == gorm.ErrRecordNotFound {
			return false, nil
		}
		return false, logger.ReturnError(res.Error)
	}
	return true, nil
}

func (db *DB) getMasterpass() (Masterpass, error) {
	m := Masterpass{}
	return m, logger.ReturnError(db.gormDb.First(&m).Error)
}

func (db *DB) DeleteCAs() error {
	return db.gormDb.Where("1=1").Delete(&CertificateAuthority{}).Error
}

func (db *DB) GetCAs() ([]CertificateAuthority, error) {
	cas := []CertificateAuthority{}
	return cas, logger.ReturnError(db.gormDb.Find(&cas).Error)
}

func (db *DB) GetAlgorithms(algorithms *Algorithm) error {
	return db.gormDb.First(algorithms).Error
}

func (db *DB) RotateErrorsBySizeOrDate() {
	if db.errorsRotationSize != nil {
		var storedErrorsSize int
		db.gormDb.Raw("SELECT SUM(pgsize) FROM dbstat WHERE name = ?;", "stored_errors").Scan(&storedErrorsSize)
		for storedErrorsSize > *db.errorsRotationSize {
			var storedError StoredError
			tx := db.gormDb.Order("error_time asc").First(&storedError)
			if tx.Error != nil {
				break
			}

			logrus.Infof("delete error %+v", storedError)
			db.gormDb.Delete(&storedError)
			db.gormDb.Raw("SELECT SUM(pgsize) FROM dbstat WHERE name = ?;", "stored_errors").Scan(&storedErrorsSize)
		}
	} else {
		db.rotateErrorsByDate()
	}
}

func sizeStrToInt(errRotSizeStr string) (int, error) {
	errRotSizeInt, err := strconv.Atoi(errRotSizeStr)
	if err != nil {
		return errRotSizeInt, err
	}
	errRotSizeInt *= 1024
	if errRotSizeInt < 4096 {
		errRotSizeInt = 4096
	}
	return errRotSizeInt, nil
}

func (db *DB) rotateErrorsByDate() {
	if db.errorsRotationSize == nil {
		changedTime := time.Now().AddDate(0, 0, -db.errorsRotationDays)
		db.gormDb.Where("error_time < ?", changedTime).Delete(StoredError{})
	}
}
