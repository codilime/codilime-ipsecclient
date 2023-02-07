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

	sv := config.NewSupervisor(log)
	softwareGenerator, err := config.NewSoftwareGenerator(&config.FileHandler{}, &sv, log)
	if err != nil {
		panic(err)
	}
	hardwareGenerator, err := config.NewHardwareGenerator(switchCreds, log)
	if err != nil {
		panic(err)
	}

	dbInstance, err := db.MakeDB("/iox_data/appdata/ipsec.db", os.Getenv("ERR_ROT_DAYS"), os.Getenv("ERR_ROT_SIZE"), log)
	if err != nil {
		panic(err)
	}

	

	app, err := NewApp(dbInstance, softwareGenerator, hardwareGenerator, switchCreds, log)
	if err != nil {
		panic(err)
	}
	app.Run("0.0.0.0:8000")
}
