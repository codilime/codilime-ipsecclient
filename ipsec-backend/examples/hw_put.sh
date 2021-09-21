curl -v -XPUT http://localhost/api/vrfs/1 -u "admin:cisco123" -d @- << EOF
{"id":1,"client_name":"hardware","vlan":0,"crypto_ph1":["aes-cbc-128","sha256","fourteen"],"crypto_ph2":["esp-aes","esp-sha-hmac","group14"],"physical_interface":"","active":true,"local_as":0,"lan_ip":"","endpoints":[]}
EOF
