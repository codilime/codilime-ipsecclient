package main

import (
	"github.com/abrander/go-supervisord"
	log "github.com/sirupsen/logrus"
)

const supervisorSocketPath = "/opt/super_net/supervisord.sock"

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

func RestartSupervisorProcess(process string) error {
	client, err := supervisord.NewUnixSocketClient(supervisorSocketPath)
	if err != nil {
		return err
	}

	defer func() {
		if err := client.Close(); err != nil {
			log.Errorf("Error during closing supervisor connection %v", err)
		}
	}()

	if err := client.StopProcess(process, true); err != nil {
		return err
	}

	if err := client.StartProcess(process, true); err != nil {
		return err
	}

	return nil
}

func GetProcessLog(name string, offset, length int) (string, error) {
	client, err := supervisord.NewUnixSocketClient(supervisorSocketPath)
	if err != nil {
		return "", err
	}

	defer func() {
		if err := client.Close(); err != nil {
			log.Errorf("Error during closing supervisor connection %v", err)
		}
	}()

	return client.ReadProcessStdoutLog(name, offset, length)
}

func GetProcessNames() ([]string, error) {
	client, err := supervisord.NewUnixSocketClient(supervisorSocketPath)
	if err != nil {
		return nil, err
	}

	defer func() {
		if err := client.Close(); err != nil {
			log.Errorf("Error during closing supervisor connection %v", err)
		}
	}()

	infos, err := client.GetAllProcessInfo()
	if err != nil {
		return nil, err
	}

	ret := []string{}
	for _, info := range infos {
		ret = append(ret, info.Name)
	}
	return ret, nil
}
