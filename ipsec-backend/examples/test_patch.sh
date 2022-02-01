#!/bin/bash

#	Copyright (c) 2021 Cisco and/or its affiliates
#
#	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
#	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

curl -k -v -XPATCH\
  https://10.67.0.2/restconf/data/ipsecclient:api/vrf=2\
  -u "admin:cisco123" -d @- << EOF
{
    "vrf": {
        "client_name":"test",
        "vlan":[
            {
                "vlan": 123,
                "lan_ip": "10.0.0.0/24"
            }
        ],
        "crypto_ph1": "aes-cbc-128.sha256.modp_2048",
        "crypto_ph2": "aes-cbc-128.sha256.modp_2048",
        "physical_interface":"eth0",
        "active":true,
        "local_as":123,
        "endpoint":[
            {
                "remote_ip_sec":"10.1.0.1",
                "local_ip":"10.2.0.1",
                "peer_ip":"10.3.0.1",
                "authentication": {
                    "type": "psk",
                    "psk": "asdasdasdasd"
                },
                "nat":true,
                "bgp":true,
                "remote_as":321,
                "source_interface":""
            }
        ]
    }
}
EOF

