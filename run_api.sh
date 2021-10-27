#!/bin/bash

set -e

docker rm sico_api || true

docker network create \
               -o com.docker.network.bridge.enable_icc=true \
               -o com.docker.network.bridge.name=ipsec_br \
               --driver=bridge \
               --subnet=10.69.0.0/24 \
               ipsec || true

docker run --name sico_api \
        --mount type=volume,source=ipsec,destination=/opt/ipsec/ \
        --mount type=volume,source=frr,destination=/opt/frr/ \
        --mount type=volume,source=super_net,destination=/opt/super_net/ \
        --mount type=volume,source=super_api,destination=/opt/super_api/ \
        --mount type=volume,source=logs,destination=/opt/logs/ \
        -e SWITCH_ADDRESS=10.69.0.10 \
        -e SWITCH_USERNAME=admin \
        -e SWITCH_PASSWORD=cisco123 \
        -e LOG_LEVEL=info \
        --network ipsec \
        --publish 80:80 \
        sico_api
