package main

import (
	"testing"
	"time"

	"gorm.io/gorm"
)

var DBError *gorm.DB

func prepareStoredErrors(db *gorm.DB) []StoredError {
	var storedErrors []StoredError
	days := 50
	for days > 0 {
		storedError := StoredError{
			ID:        uint32(51 - days),
			Message:   "2O8qxIilGDAAWkMvJPUmFS9ZP94VIMyLiG93tgLBp3Dv0VZFa2FTaTIU2b9pBkVsZ4wtYQbHBOEHp4Sfz",
			ErrorTime: time.Now().AddDate(0, 0, -days)}
		storedErrors = append(storedErrors, storedError)
		db.Create(&storedError)
		days--
	}
	return storedErrors
}

func TestRotationDefault(t *testing.T) {
	clearTableErrors()
	handler := newErrorsRotationHandler("", "")
	storedErrors := prepareStoredErrors(DBError)
	handler.rotateBySizeOrDate(DBError)

	var databaseErrors []StoredError
	DBError.Find(&databaseErrors)
	compare(databaseErrors, storedErrors[44:50], "errors", t)
}

func TestRotationSize(t *testing.T) {
	clearTableErrors()
	handler := newErrorsRotationHandler("", "5")
	storedErrors := prepareStoredErrors(DBError)
	handler.rotateBySizeOrDate(DBError)

	var databaseErrors []StoredError
	DBError.Find(&databaseErrors)
	compare(databaseErrors, storedErrors[22:50], "errors", t)
}

func TestRotationDays(t *testing.T) {
	clearTableErrors()
	handler := newErrorsRotationHandler("15", "")
	storedErrors := prepareStoredErrors(DBError)
	handler.rotateBySizeOrDate(DBError)

	var databaseErrors []StoredError
	DBError.Find(&databaseErrors)
	compare(databaseErrors, storedErrors[36:50], "errors", t)
}

func TestRotationSizeAndDays(t *testing.T) {
	clearTableErrors()
	handler := newErrorsRotationHandler("15", "5")
	storedErrors := prepareStoredErrors(DBError)
	handler.rotateBySizeOrDate(DBError)

	var databaseErrors []StoredError
	DBError.Find(&databaseErrors)
	compare(databaseErrors, storedErrors[22:50], "errors", t)
}

func clearTableErrors() {
	DBError.Where("1=1").Delete(StoredError{})
}
