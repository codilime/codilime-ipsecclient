#!/bin/bash

# Copyright (c) 2021 Cisco and/or its affiliates
#
# This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

curl -v\
  -H "Accept: application/yang-data+json"\
  -H "Content-Type: application/yang-data+json"\
  -k -u "admin:cisco123"\
  https://10.67.0.10/restconf/data/Cisco-IOS-XE-rpc:crypto -d @- << EOF
{
    "input": {
            "pki":{
                    "import": {
                            "pkcs12": "http://10.69.0.1/pkcs12/123",
                            "name-drop-node-name": "devenv12",
                            "password": "cisco123"
                    }
            }
    }
}
EOF
