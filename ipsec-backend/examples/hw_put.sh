#!/bin/bash

#	Copyright (c) 2021 Cisco and/or its affiliates
#
#	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
#	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

curl -v -k -XPUT http://localhost/api/vrfs/1 -u "admin:cisco123" -d @- << EOF
{"id":1,"client_name":"hardware","vlan":0,"crypto_ph1":["aes-cbc-128","sha256","fourteen"],"crypto_ph2":["esp-aes","esp-sha-hmac","group14"],"physical_interface":"","active":true,"local_as":0,"lan_ip":"","endpoints":[]}
EOF
