curl -k -v -XPOST\
  https://localhost/restconf/data/sico-ipsec:api/vrf\
  -u "admin:cisco123" -d @- << EOF
{
    "vrf": {
        "id":5,
        "client_name":"test",
        "vlan":[
            {
                "vlan": 123,
                "lan_ip": "10.0.0.0/24"
            },
            {
                "vlan": 124,
                "lan_ip": "11.0.0.0/24"
            }
        ],
        "crypto_ph1": "aes-cbc-128.sha256.modp_2048",
        "crypto_ph2": "aes-cbc-128.sha256.modp_2048",
        "physical_interface":"eth0",
        "active":true,
        "local_as":123,
        "endpoint":[
            {
                "id": 123,
                "vrf_id": 5,
                "remote_ip_sec":"10.1.0.1",
                "local_ip":"10.2.0.1",
                "peer_ip":"10.3.0.1",
                "authentication": {
                    "type": "psk",
                    "psk": "asdasdasdasd"
                },
                "nat":true,
                "bgp":true,
                "remote_as":321,
                "source_interface":""
            }
        ]
    }
}
EOF
