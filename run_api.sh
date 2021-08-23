#!/bin/bash

set -e

docker rm sico_api || true

docker network create \
               -o com.docker.network.bridge.enable_icc=true \
               -o com.docker.network.bridge.name=ipsec_br \
               --driver=bridge \
               --subnet=10.5.0.0/16 \
               ipsec || true

docker run --name sico_api \
        --mount type=volume,source=ipsec,destination=/opt/ipsec/ \
        --mount type=volume,source=bird,destination=/opt/bird/ \
        --mount type=volume,source=super_net,destination=/opt/super_net/ \
        --mount type=volume,source=super_api,destination=/opt/super_api/ \
        -e SWITCH_ADDRESS=10.5.0.10 \
        -e SWITCH_USERNAME=admin \
        -e SWITCH_PASSWORD=cisco123 \
        --network ipsec \
        --publish 80:80 \
        sico_api
