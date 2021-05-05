package main

import (
	"github.com/abrander/go-supervisord"
	log "github.com/sirupsen/logrus"
)

func ReloadSupervisor() error {
	c, err := supervisord.NewUnixSocketClient("/opt/super/supervisord.sock")
	if err != nil {
		return err
	}

	defer func() {
		if err := c.Close(); err != nil {
			log.Errorf("Error during closing supervisor connection %v", err)
		}
	}()

	if err = c.Update(); err != nil {
		return err
	}

	return nil
}