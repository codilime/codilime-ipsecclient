/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package config

import (
	"fmt"

	"github.com/abrander/go-supervisord"
	log "github.com/sirupsen/logrus"
)

const supervisorNetSocketPath = "/opt/super/supervisord.sock"
const supervisorApiSocketPath = "/opt/super/supervisord.sock"

type Supervisor struct {
	devlog *log.Logger
}

func NewSupervisor(devlog *log.Logger) Supervisor {
	return Supervisor{devlog: devlog}
}

//go:generate mockgen -source=supervisor.go -destination=../mock/supervisor_mock.go -package mock
type SupervisorInterface interface {
	ReloadSupervisor() error
	ReloadStrongswan() error
	ReloadVtysh() error
}

func (s *Supervisor) ReloadSupervisor() error {
	s.devlog.Debug("ReloadSupervisor invoked")

	client, err := supervisord.NewUnixSocketClient(supervisorNetSocketPath)
	if err != nil {
		return fmt.Errorf("connect to supervison though unix socket: %w", err)
	}

	defer func() {
		if err := client.Close(); err != nil {
			log.Error(fmt.Errorf("closing supervisor connection %v", err))
		}
	}()

	if err = client.Update(); err != nil {
		return fmt.Errorf("update supervisor client: %w", err)
	}

	s.devlog.Info("Supervisor reloaded")

	return nil
}

func (s *Supervisor) ReloadStrongswan() error {
	s.devlog.Debug("ReloadStrongswan invoked")

	if err := s.RestartSupervisor(supervisorNetSocketPath, "strongswan_reload"); err != nil {
		return fmt.Errorf("restarting supervisor: %w", err)
	}

	s.devlog.Info("Strongswan reloaded")

	return nil
}

func (s *Supervisor) ReloadVtysh() error {
	s.devlog.Debug("ReloadVtysh invoked")

	if err := s.RestartSupervisor(supervisorNetSocketPath, "reload_vtysh"); err != nil {
		return fmt.Errorf("restarting supervisor: %w", err)
	}

	s.devlog.Info("Vtysh reloaded")

	return nil
}

func (s *Supervisor) RestartSupervisor(socketPath, process string) error {
	s.devlog.Debug("RestartSupervisor invoked")

	client, err := supervisord.NewUnixSocketClient(socketPath)
	if err != nil {
		return fmt.Errorf("connect to supervison though unix socket: %w", err)
	}

	defer func() {
		if err := client.Close(); err != nil {
			log.Error(fmt.Errorf("closing supervisor connection %v", err))
		}
	}()

	if err := client.StopProcess(process, true); err != nil {
		return fmt.Errorf("stopping %s process: %w", process, err)
	}

	if err := client.StartProcess(process, true); err != nil {
		return fmt.Errorf("starting %s process: %w", process, err)
	}

	s.devlog.Info("Supervisor restarted")

	return nil
}

func getProcessInfosForSocketPath(socketPath string) ([]supervisord.ProcessInfo, error) {
	client, err := supervisord.NewUnixSocketClient(socketPath)
	if err != nil {
		return nil, fmt.Errorf("connect to supervison though unix socket: %w", err)
	}

	defer func() {
		if err := client.Close(); err != nil {
			log.Error(fmt.Errorf("closing supervisor connection %v", err))
		}
	}()

	infos, err := client.GetAllProcessInfo()
	if err != nil {
		return nil, fmt.Errorf("getting all process info: %w", err)
	}

	return infos, nil
}

func GetProcessInfos() ([]supervisord.ProcessInfo, error) {
	netProcesses, err := getProcessInfosForSocketPath(supervisorNetSocketPath)
	if err != nil {
		return nil, fmt.Errorf("getting process info for socket %s: %w", supervisorNetSocketPath, err)
	}

	apiProcesses, err := getProcessInfosForSocketPath(supervisorApiSocketPath)
	if err != nil {
		return nil, fmt.Errorf("getting process info for socket %s: %w", supervisorApiSocketPath, err)
	}

	ret := []supervisord.ProcessInfo{}
	ret = append(ret, netProcesses...)
	ret = append(ret, apiProcesses...)

	return ret, nil
}
