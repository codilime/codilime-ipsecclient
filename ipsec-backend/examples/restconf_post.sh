curl -v -XPOST http://localhost/restconf/data/sico-ipsec:api/vrf -u "admin:cisco123" -d @- << EOF
{
  "sico-ipsec:vrf":
    {
      "active": true,
      "client_name": "ansible_test",
      "crypto_ph1": "aes128-sha256-modp2048",
      "crypto_ph2": "aes128-sha256-modp2048",
      "endpoints": [
        {
          "authentication": {
            "local_cert": "",
            "private_key": "",
            "psk": "biędź",
            "remote_cert": "",
            "type": "psk"
          },
          "bgp": true,
          "id": "2",
          "local_ip": "192.168.1.1",
          "nat": false,
          "peer_ip": "192.168.1.2",
          "remote_as": "0",
          "remote_ip_sec": "10.69.0.10",
          "source_interface": "",
          "vrf_id": "2"
        }
      ],
      "id": "2",
      "local_as": "65001",
      "physical_interface": "eth0",
      "vlans": [
        {
          "lan_ip": "1.1.1.1/24",
          "vlan": "321"
        }
        ]
    }
}
EOF
