curl -v -XPOST http://localhost/api/vrfs -u "admin:cisco123" -d @- << EOF
{
        "id":2,
        "client_name":"test",
        "vlans":[{
            "vlan": 123,
            "lan_ip": "10.0.0.1/24"
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
        "active":true,
        "local_as":123
    }
EOF
