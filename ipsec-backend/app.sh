#!/bin/bash

curl -XPOST -H "Accept: application/yang-data+json" -H "Content-Type: application/yang-data+json" -k -u "netadmin:C1sc0DNA" https://localhost:9062/restconf/data/Cisco-IOS-XE-rpc:app-hosting -d @- << EOF
{
        "input": {
                "install": {
                        "appid": "img0",
                        "package": "http://100.65.42.11/img0.tar"
                }
        }
}
EOF
