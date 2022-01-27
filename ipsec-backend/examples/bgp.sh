#!/bin/bash

#	Copyright (c) 2021 Cisco and/or its affiliates
#
#	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
#	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

curl -v -XPATCH -H "Accept: application/yang-data+json" -H "Content-Type: application/yang-data+json" -k -u "admin:cisco123" https://10.69.0.10/restconf/data/Cisco-IOS-XE-native:native/router/bgp -d @- << EOF
{
   "bgp":[
      {
         "id":65002,
         "bgp":{
            "log-neighbor-changes":true
         },
         "neighbor":[
            {
               "id":"2012::1",
               "remote-as":65001
            }
         ]
      }
   ]
}
EOF
