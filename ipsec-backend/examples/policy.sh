#!/bin/bash

curl -v -XPATCH -H "Accept: application/yang-data+json" -H "Content-Type: application/yang-data+json" -k -u "admin:cisco123" https://10.5.0.10/restconf/data/Cisco-IOS-XE-native:native/crypto/ikev2/policy -d @- << EOF
{
		"policy": {
		  "name": "test_vrf",
		  "proposal": {
		    "proposals": "test_vrf"
		  }
		}
	}
EOF
