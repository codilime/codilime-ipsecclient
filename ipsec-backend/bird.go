package main

import (
	"errors"
	"strings"

	birdsocket "github.com/czerwonk/bird_socket"
)

func ReloadBird() error {
	ret, err := birdsocket.Query("/opt/bird/bird.ctl", "reload all")
	if err != nil {
		return err
	}
	if strings.Contains(string(ret), "failed") {
		return errors.New("reloading bird failed\n" + string(ret))
	}
	return nil
}
