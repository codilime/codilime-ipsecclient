package main

import (
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

	log.SetFormatter(&ErrorFormatter{})
	log.SetLevel(parsedLvl)

	app := App{}
	err = app.Initialize("/iox_data/appdata/ipsec.db")
	if err != nil {
		panic(err)
	}
	app.Run("0.0.0.0:8080")
}
