/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package db

import (
	"os"
	"testing"
	"time"

	"github.com/go-test/deep"
	"gorm.io/gorm"
)

func TestMain(m *testing.M) {
	os.Exit(m.Run())
}

func prepareStoredErrors(gormDb *gorm.DB) []StoredError {
	var storedErrors []StoredError
	days := 50
	for days > 0 {
		storedError := StoredError{
			ID:        uint32(51 - days),
			Message:   "2O8qxIilGDAAWkMvJPUmFS9ZP94VIMyLiG93tgLBp3Dv0VZFa2FTaTIU2b9pBkVsZ4wtYQbHBOEHp4Sfz",
			ErrorTime: time.Now().AddDate(0, 0, -days)}
		storedErrors = append(storedErrors, storedError)
		gormDb.Create(&storedError)
		days--
	}
	return storedErrors
}

func TestRotationSizeOrDateDefault(t *testing.T) {
	dbInstance, _ := MakeDB("file::memory:?cache=private", "", "")
	storedErrors := prepareStoredErrors(dbInstance.gormDb)
	dbInstance.RotateErrorsBySizeOrDate()

	var databaseErrors []StoredError
	dbInstance.gormDb.Find(&databaseErrors)
	compare(storedErrors[44:50], databaseErrors, "errors", t)
}

func TestRotationDateDefault(t *testing.T) {
	dbInstance, _ := MakeDB("file::memory:?cache=private", "", "")
	storedErrors := prepareStoredErrors(dbInstance.gormDb)
	dbInstance.rotateErrorsByDate()

	var databaseErrors []StoredError
	dbInstance.gormDb.Find(&databaseErrors)
	compare(storedErrors[44:50], databaseErrors, "errors", t)
}

func TestRotationSize(t *testing.T) {
	dbInstance, _ := MakeDB("file::memory:?cache=private", "", "5")
	storedErrors := prepareStoredErrors(dbInstance.gormDb)
	dbInstance.RotateErrorsBySizeOrDate()

	var databaseErrors []StoredError
	dbInstance.gormDb.Find(&databaseErrors)
	compare(storedErrors[22:50], databaseErrors, "errors", t)
}

func TestRotationDate(t *testing.T) {
	dbInstance, _ := MakeDB("file::memory:?cache=private", "15", "")
	storedErrors := prepareStoredErrors(dbInstance.gormDb)
	dbInstance.rotateErrorsByDate()

	var databaseErrors []StoredError
	dbInstance.gormDb.Find(&databaseErrors)
	compare(databaseErrors, storedErrors[36:50], "errors", t)
}

func TestRotationSizeOrDate(t *testing.T) {
	dbInstance, _ := MakeDB("file::memory:?cache=private", "15", "5")
	storedErrors := prepareStoredErrors(dbInstance.gormDb)
	dbInstance.RotateErrorsBySizeOrDate()

	var databaseErrors []StoredError
	dbInstance.gormDb.Find(&databaseErrors)
	compare(databaseErrors, storedErrors[22:50], "errors", t)
}

func compare(a, b interface{}, errorMessage string, t *testing.T) {
	if diff := deep.Equal(a, b); diff != nil {
		t.Fatalf("Expected "+errorMessage+" to be '%+v'. Got '%+v'. Diff %+v\n", a, b, diff)
	}
}
