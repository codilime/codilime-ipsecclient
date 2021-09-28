package main

import (
	"log"
	"os"

	"gorm.io/datatypes"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

const hardwareVrfID = 1

type Vrf struct {
	ID                int64          `json:"id"`
	ClientName        string         `json:"client_name"`
	Vlan              int            `json:"vlan"`
	CryptoPh1         datatypes.JSON `json:"crypto_ph1"`
	CryptoPh2         datatypes.JSON `json:"crypto_ph2"`
	PhysicalInterface string         `json:"physical_interface"`
	Active            *bool          `json:"active"` // pointer, otherwise it is impossible to set value to false
	LocalAs           int            `json:"local_as"`
	LanIP             string         `json:"lan_ip"`
	Endpoints         datatypes.JSON `json:"endpoints"`
}

type Setting struct {
	ID    int64
	Name  string
	Value string
}

type Masterpass struct {
	ID         int64
	Masterpass string
}

func initializeDB(dbName string) (*gorm.DB, error) {
	newLogger := logger.New(
		log.New(os.Stdout, "\n", log.LstdFlags),
		logger.Config{
			Colorful: false, // Disable color
		},
	)
	db, err := gorm.Open(sqlite.Open(dbName), &gorm.Config{
		Logger: newLogger,
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
	if err = db.AutoMigrate(&Masterpass{}); err != nil {
		return nil, err
	}
	return db, nil
}

func (Vrf) TableName() string {
	return "vrfs"
}

func (v *Vrf) getVrf(db *gorm.DB) error {
	res := db.First(v, v.ID)
	return ReturnError(res.Error)
}

func (v *Vrf) updateVrf(db *gorm.DB) error {
	res := db.Updates(v)
	return ReturnError(res.Error)
}

func (v *Vrf) deleteVrf(db *gorm.DB) error {
	res := db.Delete(v)
	return ReturnError(res.Error)
}

func (v *Vrf) createVrf(db *gorm.DB) error {
	res := db.Create(v)
	return ReturnError(res.Error)
}

func getVrfs(db *gorm.DB) ([]Vrf, error) {
	var vrfs []Vrf
	res := db.Find(&vrfs)
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
