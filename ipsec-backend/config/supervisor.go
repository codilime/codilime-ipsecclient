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
	"github.com/sirupsen/logrus"
)

const supervisorNetSocketPath = "/opt/super/supervisord.sock"
const supervisorApiSocketPath = "/opt/super/supervisord.sock"

type Supervisor struct {
	log *logrus.Logger
}

func NewSupervisor(log *logrus.Logger) Supervisor {
	return Supervisor{log: log}
}

//go:generate mockgen -source=supervisor.go -destination=../mock/supervisor_mock.go -package mock
type SupervisorInterface interface {
	ReloadSupervisor() error
	ReloadStrongswan() error
	ReloadVtysh() error
}

func (s *Supervisor) ReloadSupervisor() error {
	s.log.Info("ReloadSupervisor invoked")

	client, err := supervisord.NewUnixSocketClient(supervisorNetSocketPath)
	if err != nil {
		return fmt.Errorf("connect to supervison though unix socket: %w", err)
	}

	defer func() {
		if err := client.Close(); err != nil {
			s.log.Error(fmt.Errorf("closing supervisor connection %v", err))
		}
	}()

	if err = client.Update(); err != nil {
		return fmt.Errorf("update supervisor client: %w", err)
	}

	return nil
}

func (s *Supervisor) ReloadStrongswan() error {
	s.log.Info("ReloadStrongswan invoked")

	if err := s.RestartSupervisor(supervisorNetSocketPath, "strongswan_reload"); err != nil {
		return fmt.Errorf("restarting supervisor: %w", err)
	}

	return nil
}

func (s *Supervisor) ReloadVtysh() error {
	s.log.Info("ReloadVtysh invoked")

	if err := s.RestartSupervisor(supervisorNetSocketPath, "reload_vtysh"); err != nil {
		return fmt.Errorf("restarting supervisor: %w", err)
	}

	return nil
}

func (s *Supervisor) RestartSupervisor(socketPath, process string) error {
	s.log.Info("RestartSupervisor invoked")
	s.log.Debug(socketPath, process)

	client, err := supervisord.NewUnixSocketClient(socketPath)
	if err != nil {
		return fmt.Errorf("connect to supervison though unix socket: %w", err)
	}

	defer func() {
		if err := client.Close(); err != nil {
			s.log.Error(fmt.Errorf("closing supervisor connection %v", err))
		}
	}()

	if err := client.StopProcess(process, true); err != nil {
		return fmt.Errorf("stopping %s process: %w", process, err)
	}

	if err := client.StartProcess(process, true); err != nil {
		return fmt.Errorf("starting %s process: %w", process, err)
	}

	return nil
}

func getProcessInfosForSocketPath(socketPath string, log *logrus.Logger) ([]supervisord.ProcessInfo, error) {
	log.Info("getProcessInfosForSocketPath invoked")
	log.Debug(socketPath)

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

func GetProcessInfos(log *logrus.Logger) ([]supervisord.ProcessInfo, error) {
	log.Info("GetProcessInfos invoked")

	netProcesses, err := getProcessInfosForSocketPath(supervisorNetSocketPath, log)
	if err != nil {
		return nil, fmt.Errorf("getting process info for socket %s: %w",supervisorNetSocketPath, err)
	}

	apiProcesses, err := getProcessInfosForSocketPath(supervisorApiSocketPath, log)
	if err != nil {
		return nil, fmt.Errorf("getting process info for socket %s: %w",supervisorApiSocketPath, err)
	}

	ret := []supervisord.ProcessInfo{}
	ret = append(ret, netProcesses...)
	ret = append(ret, apiProcesses...)

	log.Debug(ret)

	return ret, nil
}
