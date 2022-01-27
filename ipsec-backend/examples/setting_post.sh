#!/bin/bash

#	Copyright (c) 2021 Cisco and/or its affiliates
#
#	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
#	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

curl -k -v -XPOST\
  https://10.67.0.2/restconf/data/sico-ipsec:api/setting=test_name\
  -u "admin:cisco123" -d @- << EOF
{
   "setting": {
      "name":"test_name",
      "value":"test_value"
   }
}
EOF
