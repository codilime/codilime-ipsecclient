curl -v -XPOST http://localhost/restconf/data/sico-ipsec:api/vrf -u "admin:cisco123" -d @- << EOF
{
    "vrf": {
        "id":5,
        "client_name":"test",
        "vlan":[{
            "vlan": 123,
            "lan_ip": "10.0.0.1/24"
        }],
        "crypto_ph1": "aes-cbc-128.sha256.modp_2048",
        "crypto_ph2": "aes-cbc-128.sha256.modp_2048",
        "physical_interface":"eth0",
        "active":true,
        "local_as":123
    }
}
EOF
