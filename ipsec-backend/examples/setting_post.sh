#!/bin/bash

curl -k -v -XPOST\
  https://localhost/restconf/data/sico-ipsec:api/setting=test_name\
  -u "admin:cisco123" -d @- << EOF
{
   "setting": {
      "name":"test_name",
      "value":"test_value"
   }
}
EOF
