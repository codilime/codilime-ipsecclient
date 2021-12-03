package main

import (
	"ipsec_backend/config"
	"ipsec_backend/db"
	"ipsec_backend/logger"
	"os"

	log "github.com/sirupsen/logrus"
)

func main() {
	lvl, ok := os.LookupEnv("LOG_LEVEL")
	if !ok {
		lvl = "info"
	}

	parsedLvl, err := log.ParseLevel(lvl)
	if err != nil {
		parsedLvl = log.InfoLevel
	}

	log.SetFormatter(&logger.ErrorFormatter{})
	log.SetLevel(parsedLvl)

	switchCreds := db.SwitchCreds{os.Getenv("SWITCH_USERNAME"), os.Getenv("SWITCH_PASSWORD")}

	softwareGenerator := &config.SoftwareGenerator{&config.FileHandler{}, &config.Supervisor{}}
	hardwareGenerator, err := config.NewHardwareGenerator(switchCreds)
	if err != nil {
		panic(err)
	}

	dbInstance, err := db.MakeDB("/iox_data/appdata/ipsec.db", os.Getenv("ERR_ROT_DAYS"), os.Getenv("ERR_ROT_SIZE"))
	if err != nil {
		panic(err)
	}

	app, err := NewApp(dbInstance, softwareGenerator, hardwareGenerator, switchCreds)
	if err != nil {
		panic(err)
	}
	app.Run("0.0.0.0:8000")
}
