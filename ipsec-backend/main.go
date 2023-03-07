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

	apilog "github.com/sirupsen/logrus"
)

func main() {
	switchCreds := db.SwitchCreds{
		Username:      os.Getenv("SWITCH_USERNAME"),
		Password:      os.Getenv("SWITCH_PASSWORD"),
		SwitchAddress: os.Getenv("SWITCH_IP"),
	}

	lvl, ok := os.LookupEnv("LOG_LEVEL")
	if !ok {
		lvl = "info"
	}

	parsedLvl, err := apilog.ParseLevel(lvl)
	if err != nil {
		parsedLvl = apilog.InfoLevel
	}

	apilog.SetFormatter(&logger.ErrorFormatter{})
	apilog.SetLevel(parsedLvl)

	devlog, err := logger.NewDevLogger(parsedLvl)
	if err != nil{
		panic(err)
	}

	sv := config.NewSupervisor(devlog)
	devlog.Debug("Supervisor created")

	softwareGenerator, err := config.NewSoftwareGenerator(&config.FileHandler{}, &sv, devlog)
	if err != nil {
		panic(err)
	}

	devlog.Debug("SoftwareGenerator created")
	hardwareGenerator, err := config.NewHardwareGenerator(switchCreds, devlog)
	if err != nil {
		panic(err)
	}

	devlog.Debug("HardwareGenerator created")

	dbInstance, err := db.MakeDB("/iox_data/appdata/ipsec.db", os.Getenv("ERR_ROT_DAYS"), os.Getenv("ERR_ROT_SIZE"))
	if err != nil {
		panic(err)
	}

	devlog.Debug("DB created")

	app, err := NewApp(dbInstance, softwareGenerator, hardwareGenerator, switchCreds, devlog)
	if err != nil {
		panic(err)
	}

	devlog.Debug("App created")
	devlog.Debug("Running app...")

	app.Run("0.0.0.0:8000")
}
