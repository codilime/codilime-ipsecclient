curl -v -k http://0.0.0.0:8404/restconf/data/sico-ipsec:api/source-interface -u "admin:cisco123"

curl -v -k https://127.0.0.1/restconf/data/sico-ipsec:api/source-interface -u "admin:cisco123"

curl -v -k http://0.0.0.0:8404/monitor


curl -v -k http://0.0.0.0:333/restconf/data/sico-ipsec:api/source-interface -u "admin:cisco123"


ip vrf exec mng-vrf curl -v -k http://0.0.0.0:333/restconf/data/sico-ipsec:api/source-interface -u "admin:cisco123"


ip vrf exec mng-vrf curl -v -k https://0.0.0.0/restconf/data/sico-ipsec:api/source-interface -u "admin:cisco123"
