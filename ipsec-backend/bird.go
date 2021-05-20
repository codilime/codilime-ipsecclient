package main

import (
	"errors"
	"strings"

	birdsocket "github.com/czerwonk/bird_socket"
)

func ReloadBird() error {
	ret, err := birdsocket.Query("/opt/bird/bird.ctl", "configure")
	if err != nil {
		return err
	}
	if strings.Contains(string(ret), "failed") || strings.Contains(string(ret), "error") {
		return errors.New("reloading bird failed\n" + string(ret))
	}
	return nil
}
