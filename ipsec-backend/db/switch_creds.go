/*
 *	Copyright (c) 2021 Cisco and/or its affiliates
 *
 *	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

package db

type SwitchCreds struct {
	Username      string
	Password      string
	SwitchAddress string
	WhenEspHmac   string
}
