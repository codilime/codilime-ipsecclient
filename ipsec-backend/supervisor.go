package main

import (
	"fmt"

	"github.com/abrander/go-supervisord"
)

const supervisorNetSocketPath = "/opt/super_net/supervisord.sock"
const supervisorApiSocketPath = "/opt/super_api/supervisord.sock"

type Supervisor struct{}

type SupervisorInterface interface {
	ReloadSupervisor() error
	ReloadStrongswan() error
	ReloadVtysh() error
}

func (s *Supervisor) ReloadSupervisor() error {
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

func (s *Supervisor) ReloadStrongswan() error {
	if err := s.RestartSupervisor(supervisorNetSocketPath, "strongswan_reload"); err != nil {
		return ReturnError(err)
	}
	return nil
}

func (s *Supervisor) ReloadVtysh() error {
	if err := s.RestartSupervisor(supervisorNetSocketPath, "reload_vtysh"); err != nil {
		return ReturnError(err)
	}
	return nil
}

func (s *Supervisor) RestartSupervisor(socketPath, process string) error {
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

func getProcessInfosForSocketPath(socketPath string) ([]supervisord.ProcessInfo, error) {
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

	return infos, nil
}

func GetProcessInfos() ([]supervisord.ProcessInfo, error) {
	netProcesses, err := getProcessInfosForSocketPath(supervisorNetSocketPath)
	if err != nil {
		return nil, ReturnError(err)
	}
	apiProcesses, err := getProcessInfosForSocketPath(supervisorApiSocketPath)
	if err != nil {
		return nil, ReturnError(err)
	}
	ret := []supervisord.ProcessInfo{}
	ret = append(ret, netProcesses...)
	ret = append(ret, apiProcesses...)
	return ret, nil
}
