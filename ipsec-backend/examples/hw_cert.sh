#!/bin/bash

TEST_PFX=`cat ../../dev-env/UI/test.pfx.b64`

curl -v -XPATCH\
  http://localhost/restconf/data/sico-ipsec:api/vrf=1\
  -u "admin:cisco123" -d @- << EOF
{
    "vrf": {
        "id":1,
        "client_name":"hardware",
        "crypto_ph1": "aes-cbc-128.sha256.fourteen",
        "crypto_ph2": "esp-aes.esp-sha-hmac.group14",
        "physical_interface":"eth0",
        "active":true,
        "local_as":123,
        "endpoint": [{
                "id": 123,
                "vrf_id": 1,
                "remote_ip_sec":"10.1.0.1",
                "local_ip":"10.2.0.1",
                "peer_ip":"10.3.0.1",
                "authentication": {
                    "type": "certs",
                    "psk": "cisco123",
                    "pkcs12_base64": "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\no5PJDZBhBAiEB7GKiLBkrQICCAA="
                },
                "nat":false,
                "bgp":true,
                "remote_as":321,
                "source_interface":"GigabitEthernet1"
        }]
    }
}
EOF
