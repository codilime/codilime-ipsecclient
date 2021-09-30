package main

import (
	"fmt"
	"strings"

	"github.com/abrander/go-supervisord"
)

const supervisorNetSocketPath = "/opt/super_net/supervisord.sock"
const supervisorApiSocketPath = "/opt/super_api/supervisord.sock"

func ReloadSupervisor() error {
	client, err := supervisord.NewUnixSocketClient(supervisorNetSocketPath)
	if err != nil {
		return ReturnError(err)
	}

	defer func() {
		if err := client.Close(); err != nil {
			Error(fmt.Errorf("Error during closing supervisor connection %v", err))
		}
	}()

	if err = client.Update(); err != nil {
		return ReturnError(err)
	}

	return nil
}

func RestartSupervisorProcess(socketPath, process string) error {
	client, err := supervisord.NewUnixSocketClient(socketPath)
	if err != nil {
		return ReturnError(err)
	}

	defer func() {
		if err := client.Close(); err != nil {
			Error(fmt.Errorf("Error during closing supervisor connection %v", err))
		}
	}()

	if err := client.StopProcess(process, true); err != nil {
		return ReturnError(err)
	}

	if err := client.StartProcess(process, true); err != nil {
		return ReturnError(err)
	}

	return nil
}

func GetProcessLog(name string, offset, length int) (string, error) {
	netClient, err := supervisord.NewUnixSocketClient(supervisorNetSocketPath)
	if err != nil {
		return "", ReturnError(err)
	}

	defer func() {
		if err := netClient.Close(); err != nil {
			Error(fmt.Errorf("Error during closing supervisor connection %v", err))
		}
	}()

	log, err := netClient.ReadProcessStdoutLog(name, offset, length)
	if err == nil {
		return log, ReturnError(err)
	}
	if strings.Contains(err.Error(), "BAD_NAME:") {
		apiClient, err := supervisord.NewUnixSocketClient(supervisorApiSocketPath)
		if err != nil {
			return "", ReturnError(err)
		}
		defer func() {
			if err := apiClient.Close(); err != nil {
				Error(fmt.Errorf("Error during closing supervisor connection %v", err))
			}
		}()
		log, err := apiClient.ReadProcessStdoutLog(name, offset, length)
		return log, ReturnError(err)
	}
	return log, ReturnError(err)
}

func getProcessNameForSocketPath(socketPath string) ([]string, error) {
	client, err := supervisord.NewUnixSocketClient(socketPath)
	if err != nil {
		return nil, ReturnError(err)
	}

	defer func() {
		if err := client.Close(); err != nil {
			Error(fmt.Errorf("Error during closing supervisor connection %v", err))
		}
	}()

	infos, err := client.GetAllProcessInfo()
	if err != nil {
		return nil, ReturnError(err)
	}

	ret := []string{}
	for _, info := range infos {
		ret = append(ret, info.Name)
	}
	return ret, nil
}

func GetProcessNames() ([]string, error) {
	netProcesses, err := getProcessNameForSocketPath(supervisorNetSocketPath)
	if err != nil {
		return nil, ReturnError(err)
	}
	apiProcesses, err := getProcessNameForSocketPath(supervisorApiSocketPath)
	if err != nil {
		return nil, ReturnError(err)
	}
	ret := []string{}
	ret = append(ret, netProcesses...)
	ret = append(ret, apiProcesses...)
	return ret, nil
}
