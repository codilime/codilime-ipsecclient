#!/bin/bash

#	Copyright (c) 2021 Cisco and/or its affiliates
#
#	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
#	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

curl -v -XPATCH -H "Accept: application/yang-data+json" -H "Content-Type: application/yang-data+json" -k -u "admin:cisco123" https://10.67.0.10/restconf/data/Cisco-IOS-XE-native:native/interface -d @- << EOF
{
   "interface":[
      {
         "Tunnel":{
            "name":1,
            "ipv6":{
               "address":{
                  "prefix-list":[
                     {
                        "prefix":"2012::1/64"
                     }
                  ]
               },
               "enable":[
                  null
               ]
            },
            "Cisco-IOS-XE-tunnel:tunnel":{
               "source":"GigabitEthernet1",
               "destination-config":{
                  "ipv4":"10.69.0.1"
               },
               "mode":{
                  "ipsec":{
                     "ipv4":{
                        
                     }
                  }
               },
               "protection":{
                  "Cisco-IOS-XE-crypto:ipsec":{
                     "profile-option":{
                        "name":"hardware_psk"
                     }
                  }
               }
            }
         }
      }
   ]
}
EOF
