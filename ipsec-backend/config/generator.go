/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package config

import (
	"ipsec_backend/db"
	"ipsec_backend/sico_yang"
	"strings"
)

//go:generate mockgen -source=generator.go -destination=../mock/generator_mock.go -package mock
type Generator interface {
	GenerateConfigs(v db.Vrf, switchCreds ...db.SwitchCreds) error
	DeleteConfigs(v db.Vrf, switchCreds ...db.SwitchCreds) error
	GetMonitoring(clientName *string, switchCreds ...db.SwitchCreds) (*sico_yang.SicoIpsec_Api_Monitoring, error)
}

func normalizeStatus(status string) string {
	if status == "ESTABLISHED" || status == "crypto-sa-status-active" {
		return "up"
	} else {
		return "down"
	}
}

func normalizeLocalIP(localIp, remoteIp string) string {
	if localIp == "%any" {
		if strings.Contains(remoteIp, ":") {
			return "::"
		}
		return "0.0.0.0"
	}
	return localIp
}
