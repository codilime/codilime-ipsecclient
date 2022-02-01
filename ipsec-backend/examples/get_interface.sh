#!/bin/bash

#	Copyright (c) 2021 Cisco and/or its affiliates
#
#	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
#	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

curl -v -k\
   https://10.67.0.2/restconf/data/ipsecclient:api/source-interface\
   -u "admin:cisco123"
