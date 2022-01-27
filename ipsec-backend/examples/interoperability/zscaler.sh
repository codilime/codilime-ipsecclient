#!/bin/bash

# Copyright (c) 2021 Cisco and/or its affiliates
#
# This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# available here: https://developer.cisco.com/site/license/cisco-sample-code-license/


curl -k -v -XPOST\
  https://10.67.0.2/restconf/data/sico-ipsec:api/vrf\
  -u "admin:cisco123" -d @- << EOF
{
  "vrf": {
    "client_name": "zscaler",
    "vlan": [
      {
        "vlan": 321,
        "lan_ip": "1.1.1.1/24"
      }
    ],
    "crypto_ph1": "aes128.sha1.ecp256",
    "crypto_ph2": "aes128.sha1.ecp256",
    "physical_interface": "eth0",
    "active": true,
    "local_as": 0,
    "endpoint": [
      {
        "remote_ip_sec": "165.225.206.38",
        "local_ip": "192.168.1.1",
        "peer_ip": "192.168.1.2",
        "remote_as": 0,
        "nat": false,
        "bgp": false,
        "source_interface": "",
        "authentication": {
          "type": "psk",
          "psk": "AeFie6voo1Ou0quo",
          "local_id": "codilime1@mak-pros.com",
          "local_cert": "",
          "remote_cert": "",
          "private_key": ""
        }
      }
    ]
  }
}
EOF
