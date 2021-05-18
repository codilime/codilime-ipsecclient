package main

import (
	"strings"

	"github.com/abrander/go-supervisord"
	log "github.com/sirupsen/logrus"
)

const supervisorSocketPath = "/opt/super/supervisord.sock"

func ReloadSupervisor() error {
	client, err := supervisord.NewUnixSocketClient(supervisorSocketPath)
	if err != nil {
		return err
	}

	defer func() {
		if err := client.Close(); err != nil {
			log.Errorf("Error during closing supervisor connection %v", err)
		}
	}()

	if err = client.Update(); err != nil {
		return err
	}

	return nil
}

func GetSupervisorState() (map[string]string, error) {
	client, err := supervisord.NewUnixSocketClient(supervisorSocketPath)
	if err != nil {
		return nil, err
	}

	defer func() {
		if err := client.Close(); err != nil {
			log.Errorf("Error during closing supervisor connection %v", err)
		}
	}()

	processInfos, err := client.GetAllProcessInfo()
	if err != nil {
		return nil, err
	}
	res := map[string]string{}
	for _, processInfo := range processInfos {
		res[processInfo.Name] = processInfo.StateName + " " + processInfo.SpawnErr
	}

	return res, nil
}

func GetSupervisorSingleState(name string) (map[string]string, error) {
	client, err := supervisord.NewUnixSocketClient(supervisorSocketPath)
	if err != nil {
		return nil, err
	}

	defer func() {
		if err := client.Close(); err != nil {
			log.Errorf("Error during closing supervisor connection %v", err)
		}
	}()

	res := map[string]string{}
	processInfo, err := client.GetProcessInfo(name)
	if err != nil {
		if strings.Contains(err.Error(), "BAD_NAME") {
			return res, nil
		}
		return nil, err
	}
	res[processInfo.Name] = processInfo.StateName + " " + processInfo.SpawnErr

	return res, nil
}
