#!/bin/bash

curl -v -XPOST http://localhost/restconf/data/sico-ipsec:api/password -u "admin:cisco123" -d @- << EOF
{
        "password": "innehaslo"
}
