#!/bin/bash

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
