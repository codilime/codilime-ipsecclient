#!/bin/bash

# Copyright (c) 2021 Cisco and/or its affiliates
#
# This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

curl -v -H "Accept: application/yang-data+json" -H "Content-Type: application/yang-data+json"  -k -u "admin:cisco123" https://10.67.0.10/restconf/data/Cisco-IOS-XE-native:native/interface
