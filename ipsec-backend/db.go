package main

import (
	"gorm.io/datatypes"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

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

func initializeDB(dbName string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dbName), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	if err = db.AutoMigrate(&Vrf{}); err != nil {
		return nil, err
	}
	return db, nil
}

func (Vrf) TableName() string {
	return "vrfs"
}

func (v *Vrf) getVrf(db *gorm.DB) error {
	res := db.First(v, v.ID)
	return res.Error
}

func (v *Vrf) updateVrf(db *gorm.DB) error {
	res := db.Updates(v)
	return res.Error
}

func (v *Vrf) deleteVrf(db *gorm.DB) error {
	res := db.Delete(v)
	return res.Error
}

func (v *Vrf) createVrf(db *gorm.DB) error {
	res := db.Create(v)
	return res.Error
}

func getVrfs(db *gorm.DB) ([]Vrf, error) {
	var vrfs []Vrf
	res := db.Find(&vrfs)
	return vrfs, res.Error
}
