package main

import (
	"fmt"
	"strconv"
	"time"

	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

const DefaultErrorsRotationDays = 7

type ErrorsRotationHandler struct {
	errorsRotationDays int
	errorsRotationSize *int // Size in Bytes
}

// errRotSizeStr is KB
func newErrorsRotationHandler(errRotDaysStr, errRotSizeStr string) *ErrorsRotationHandler {
	e := new(ErrorsRotationHandler)

	if errRotDaysStr == "" {
		e.errorsRotationDays = DefaultErrorsRotationDays
	} else {
		errRotDaysInt, err := strconv.Atoi(errRotDaysStr)
		if err != nil {
			e.errorsRotationDays = DefaultErrorsRotationDays
		} else {
			e.errorsRotationDays = errRotDaysInt
		}
	}

	if errRotSizeStr == "" {
		e.errorsRotationSize = nil
	} else {
		errRotSizeInt, err := sizeStrToInt(errRotSizeStr)
		if err != nil {
			e.errorsRotationSize = nil
		} else {
			e.errorsRotationSize = new(int)
			*e.errorsRotationSize = errRotSizeInt
		}
	}
	return e
}

func sizeStrToInt(errRotSizeStr string) (int, error) {
	errRotSizeInt, err := strconv.Atoi(errRotSizeStr)
	if err != nil {
		return errRotSizeInt, err
	}
	fmt.Printf("sizeStrToInt errRotSizeStr %d\n", errRotSizeInt)
	errRotSizeInt *= 1024
	fmt.Printf("sizeStrToInt errRotSizeStr %d\n", errRotSizeInt)
	if errRotSizeInt < 4096 {
		errRotSizeInt = 4096
	}
	fmt.Printf("sizeStrToInt errRotSizeStr %d\n", errRotSizeInt)
	return errRotSizeInt, nil
}

func (e *ErrorsRotationHandler) rotateByDate(db *gorm.DB) {
	if e.errorsRotationSize == nil {
		changedTime := time.Now().AddDate(0, 0, -e.errorsRotationDays)
		db.Where("error_time < ?", changedTime).Delete(StoredError{})
	}
}

func (e *ErrorsRotationHandler) rotateBySizeOrDate(db *gorm.DB) {
	if e.errorsRotationSize != nil {
		var storedErrorsSize int
		db.Raw("SELECT SUM(pgsize) FROM dbstat WHERE name = ?;", "stored_errors").Scan(&storedErrorsSize)
		for storedErrorsSize > *e.errorsRotationSize {
			var storedError StoredError
			tx := db.Order("error_time asc").First(&storedError)
			if tx.Error != nil {
				break
			}

			log.Infof("delete error %+v", storedError)
			db.Delete(&storedError)
			db.Raw("SELECT SUM(pgsize) FROM dbstat WHERE name = ?;", "stored_errors").Scan(&storedErrorsSize)
		}
		fmt.Printf("\nstoredErrorsSize: %d OK\n", storedErrorsSize)
	} else {
		e.rotateByDate(db)
	}
}
