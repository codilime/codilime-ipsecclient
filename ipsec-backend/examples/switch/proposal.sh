#!/bin/bash

curl -v -XPATCH\
  -H "Accept: application/yang-data+json"\
  -H "Content-Type: application/yang-data+json"\
  -k -u "admin:cisco123"\
  https://10.67.0.10/restconf/data/Cisco-IOS-XE-native:native/crypto/ikev2/proposal -d @- << EOF
{
		"proposal": {
		  "name": "test_vrf",
		  "encryption": {
		    "aes-gcm-128": [null]
		  },
		  "integrity": {
		    "sha256": [null]
		  },
		  "prf": {
		    "sha256": [null]
		  },
		  "group": {
		    "fourteen": [null]
		  }
		}
	}
EOF
