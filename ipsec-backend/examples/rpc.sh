#!/bin/bash

curl -v -H "Accept: application/yang-data+json" -H "Content-Type: application/yang-data+json" -k -u "admin:cisco123" https://10.69.0.10/restconf/data/Cisco-IOS-XE-rpc:crypto -d @- << EOF
{
    "input": {
            "pki":{
                    "import": {
                            "pkcs12": "http://10.69.0.1/pkcs12/123",
                            "name-drop-node-name": "devenv12",
                            "password": "cisco123"
                    }
            }
    }
}
EOF
