/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package main

import (
	"ipsec_backend/config"
	"ipsec_backend/db"
	"ipsec_backend/logger"
	"os"
)

func main() {
	switchCreds := db.SwitchCreds{
		Username:      os.Getenv("SWITCH_USERNAME"),
		Password:      os.Getenv("SWITCH_PASSWORD"),
		SwitchAddress: os.Getenv("SWITCH_IP"),
	}

	log, err := logger.NewLogger()
	log.Info("logger created")

	sv := config.NewSupervisor(log)
	log.Info("Supervisor created")

	softwareGenerator, err := config.NewSoftwareGenerator(&config.FileHandler{}, &sv, log)
	if err != nil {
		panic(err)
	}

	log.Info("SoftwareGenerator created")
	hardwareGenerator, err := config.NewHardwareGenerator(switchCreds, log)
	if err != nil {
		panic(err)
	}

	log.Info("HardwareGenerator created")

	dbInstance, err := db.MakeDB("/iox_data/appdata/ipsec.db", os.Getenv("ERR_ROT_DAYS"), os.Getenv("ERR_ROT_SIZE"), log)
	if err != nil {
		panic(err)
	}

	log.Info("DB created")

	app, err := NewApp(dbInstance, softwareGenerator, hardwareGenerator, switchCreds, log)
	if err != nil {
		panic(err)
	}

	log.Info("App created")
	log.Info("Running app...")

	app.Run("0.0.0.0:8000")
}
