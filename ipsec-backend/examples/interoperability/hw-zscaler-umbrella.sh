#!/bin/bash

curl -k -v\
  -XPATCH https://10.67.0.2/restconf/data/sico-ipsec:api/vrf=1\
  -u "admin:cisco123" -d @- << EOF
{
  "vrf": {
    "client_name": "hardware",
    "crypto_ph1": "aes-cbc-128.sha256.fourteen",
    "crypto_ph2": "esp-aes.esp-sha256-hmac.group14",
    "physical_interface": "eth0",
    "active": true,
    "local_as": 65002,
    "ospf": false,
    "endpoint": [
      {
        "remote_ip_sec": "165.225.206.38",
        "local_ip": "192.168.1.1",
        "peer_ip": "192.168.1.2",
        "remote_as": 0,
        "nat": false,
        "bgp": false,
        "source_interface": "GigabitEthernet1",
        "authentication": {
          "type": "psk",
          "psk": "AeFie6voo1Ou0quo",
          "local_id": "codilime1@mak-pros.com",
          "local_cert": "",
          "remote_cert": "",
          "private_key": ""
        }
      },
      {
        "remote_ip_sec": "146.112.66.8",
        "local_ip": "192.168.2.1",
        "peer_ip": "192.168.2.2",
        "remote_as": 0,
        "nat": false,
        "bgp": false,
        "source_interface": "GigabitEthernet1",
        "authentication": {
          "type": "psk",
          "psk": "AeFie6voo1Ou0quo",
          "local_id": "94.75.122.122",
          "local_cert": "",
          "remote_cert": "",
          "private_key": ""
        }
      }
    ]
  }
}
EOF
