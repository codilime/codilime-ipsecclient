package main

import (
	"errors"
	"strings"
	"time"

	birdsocket "github.com/michalzurawski/bird_socket"
)

const (
	birdSocketPath = "/opt/bird/bird.ctl"
	birdTimeout    = time.Second
)

func ReloadBird() error {
	s := birdsocket.NewSocket(birdSocketPath, birdsocket.WithReadDeadline(birdTimeout))
	if _, err := s.Connect(); err != nil {
		return err
	}
	ret, err := s.Query("configure")
	if err != nil {
		return err
	}
	if strings.Contains(string(ret), "failed") || strings.Contains(string(ret), "error") {
		return errors.New("reloading bird failed\n" + string(ret))
	}
	return nil
}
