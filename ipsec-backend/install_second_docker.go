package main

import (
	"crypto/tls"
	"fmt"
	"net/http"
	"time"
)

const secondDockerName = "sico_net"

func installSecondDocker() {
	fmt.Println("sleeping")
	time.Sleep(time.Second * 20)
	fmt.Println("waking up")
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	appHostingCfg := `{
			"Cisco-IOS-XE-app-hosting-cfg:app": {
			  "application-name": "` + secondDockerName + `",
			  "application-network-resource": {
			    "virtualportgroup-application-default-gateway-1": "100.65.42.254",
			    "virtualportgroup-guest-interface-default-gateway-1": 1,
			    "appintf-vlan-mode": "appintf-trunk"
			  },
			  "appintf-vlan-rules": {
			    "appintf-vlan-rule": [
			      {
				"vlan-id": 42,
				"guest-interface": 1,
				"guest-ip": "100.65.42.14",
				"guest-ipnetmask": "255.255.255.0"
			      }
			    ]
			  },
			  "docker-resource": true,
			"run-optss": {
			"run-opts": [
			{
				"line-index": 1,
				"line-run-opts": "--mount type=volume,source=ipsec,destination=/opt/ipsec/"
			},
			{
				"line-index": 2,
				"line-run-opts": "--mount type=volume,source=bird,destination=/opt/bird/"
			}
			]
			}
			}
		      }`
	err := restconfDoRequest("PATCH", "Cisco-IOS-XE-app-hosting-cfg:app-hosting-cfg-data/apps/app", appHostingCfg, client)
	if err != nil {
		fmt.Println("ERROR", err.Error())
	}

	rpcInstall := `{
			"input": {
				"install": {
					"appid": "` + secondDockerName + `",
					"package": "http://100.65.42.13:9999/` + secondDockerName + `.tar.gz"
				}
			}
		}`
	err = restconfDoRequest("POST", "Cisco-IOS-XE-rpc:app-hosting", rpcInstall, client)
	if err != nil {
		fmt.Println("ERROR", err.Error())
	}
	rpcActivate := `{
			"input": {
				"activate": {
					"appid": "` + secondDockerName + `"
				}
			}
		}`
	err = restconfDoRequest("POST", "Cisco-IOS-XE-rpc:app-hosting", rpcActivate, client)
	if err != nil {
		fmt.Println("ERROR", err.Error())
	}
	rpcStart := `{
			"input": {
				"start": {
					"appid": "` + secondDockerName + `"
				}
			}
		}`
	err = restconfDoRequest("POST", "Cisco-IOS-XE-rpc:app-hosting", rpcStart, client)
	if err != nil {
		fmt.Println("ERROR", err.Error())
	}
}
