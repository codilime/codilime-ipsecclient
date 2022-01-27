curl -k -v -XPOST\
  https://10.67.0.2/restconf/data/sico-ipsec:api/vrf\
  -u "admin:cisco123" -d @- << EOF
{
    "vrf": {
            "client_name": "test1",
            "vlan": [{"vlan": 123, "lan_ip": "10.0.0.0/24"}],
            "crypto_ph1": "aes-cbc-128.sha256.modp_2048",
            "crypto_ph2": "esp-gcm.fourteen",
            "physical_interface": "eth0",
            "active": true,
            "disable_peer_ips": false,
            "local_as": 123,
            "ospf": false,
            "endpoint": [
                {
                    "remote_ip_sec": "10.1.0.1",
                    "local_ip": "10.2.0.1",
                    "peer_ip": "10.2.0.2",
                    "authentication": {
                        "type": "psk",
                        "psk": "asdasdasdasd",
                        "local_id": "test@codilime.com",
                        "local_cert": "",
                        "pkcs12_base64": "",
                        "private_key": "",
                        "remote_cert": ""
                    },
                    "nat": true,
                    "bgp": true,
                    "remote_as": 321,
                    "source_interface": ""
                }
            ]
        }
}
EOF
