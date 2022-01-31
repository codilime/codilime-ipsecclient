#!/bin/bash

#	Copyright (c) 2021 Cisco and/or its affiliates
#
#	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
#	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

curl -v -k -XPOST\
  http://localhost/restconf/data/sico-ipsec:api/password\
  -u "admin:cisco123" -d @- << EOF
{
  "password": "innehaslo"
}
