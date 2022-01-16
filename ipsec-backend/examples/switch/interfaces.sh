#!/bin/bash

curl -v -XPATCH\
  -H "Accept: application/yang-data+json"\
  -H "Content-Type: application/yang-data+json"\
  -k -u "admin:cisco123"\
  https://10.69.0.10/restconf/data/Cisco-IOS-XE-native:native/interface -d @- << EOF
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
