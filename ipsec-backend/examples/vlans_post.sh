curl -v -XPOST http://localhost:8000/api/vrfs -u "admin:cisco123" -d @- << EOF
{
   "id":1,
   "client_name":"test",
   "vlans": [{
   "vlan":123,
   "lan_ip":"10.0.0.1"
   }],
   "crypto_ph1":[
      "aes-cbc-128",
      "sha256",
      "modp_2048"
   ],
   "crypto_ph2":[
      "esp-gcm",
      "fourteen"
   ],
   "physical_interface":"eth0",
   "active":false,
   "local_as":123,
   "endpoints":[]
}
EOF

