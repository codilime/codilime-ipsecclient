curl -v -XPUT http://localhost/api/vrfs/2 -u "admin:cisco123" -d @- << EOF
{
        "id":2,
        "client_name":"test",
        "vlan":123,
        "crypto_ph1":[
            "aes128",
            "sha256",
            "modp1024"
        ],
        "crypto_ph2":[
            "aes128",
            "sha1",
            "modp1024"
        ],
        "physical_interface":"eth0",
        "active":true,
        "local_as":123,
        "lan_ip":"10.0.0.1",
        "endpoints":[
            {
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
            },
            {
                "remote_ip_sec":"10.11.0.1",
                "local_ip":"10.12.0.1",
                "peer_ip":"10.13.0.1",
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
EOF

