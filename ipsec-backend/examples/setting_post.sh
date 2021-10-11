#!/bin/bash

curl -v -XPOST http://localhost/restconf/data/sico-ipsec:api/setting=siemka -u "admin:cisco123" -d @- << EOF
{
        "setting": {
                "name": "siemka",
                "value": "tasiemka"
        }
}
