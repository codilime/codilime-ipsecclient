#!/bin/bash

set -e

docker network create --subnet 10.69.0.0/24 sico || true
docker rm sico_api || true

docker run --name sico_api \
        --mount type=volume,source=ipsec,destination=/opt/ipsec/ \
        --mount type=volume,source=frr,destination=/opt/frr/ \
        --mount type=volume,source=super_net,destination=/opt/super_net/ \
        --mount type=volume,source=super_api,destination=/opt/super_api/ \
        -e SWITCH_ADDRESS=10.5.0.10 \
        -e SWITCH_USERNAME=admin \
        -e SWITCH_PASSWORD=cisco123 \
        --network sico \
        --publish 80:80 \
        sico_api
