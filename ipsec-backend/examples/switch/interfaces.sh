#!/bin/bash

# Copyright (c) 2021 Cisco and/or its affiliates
#
# This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

curl -v -XPATCH\
  -H "Accept: application/yang-data+json"\
  -H "Content-Type: application/yang-data+json"\
  -k -u "admin:cisco123"\
  https://10.67.0.10/restconf/data/Cisco-IOS-XE-native:native/interface -d @- << EOF
{
  "Cisco-IOS-XE-native:interface": {
    "Loopback": [
      {
        "name": 0,
        "description": "testowy_interfejs",
        "ip": {
          "address": {
            "primary": {
              "address": "192.168.10.1",
              "mask": "255.255.255.0"
            }
          }
        }
      },
      {
        "name": 1,
        "description": "twoja stara",
        "ip": {
          "address": {
            "primary": {
              "address": "192.168.11.1",
              "mask": "255.255.255.0"
            }
          }
        }
      },
      {
        "name": 2,
        "description": "twoj stary",
        "ip": {
          "address": {
            "primary": {
              "address": "192.168.12.1",
              "mask": "255.255.255.0"
            }
          }
        }
      }
    ]
  }
}
EOF
