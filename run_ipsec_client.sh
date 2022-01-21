#!/bin/bash

set -e

docker stop sico || true
docker rm sico || true

# docker network rm aipsec eth1 eth2 ipsec || true

docker network create \
               -o com.docker.network.bridge.enable_icc=true \
               -o com.docker.network.bridge.name=ipsec_br \
               --driver=bridge \
               --subnet=10.67.0.0/24 \
               aipsec || true

docker network create \
               -o com.docker.network.bridge.enable_icc=true \
               -o com.docker.network.bridge.name=eth1 \
               --driver=bridge \
               --subnet=10.68.0.0/24 \
               eth1 || true

docker network create \
               -o com.docker.network.bridge.enable_icc=true \
               -o com.docker.network.bridge.name=eth2 \
               --driver=bridge \
               --subnet=10.69.0.0/24 \
               eth2 || true

docker create --cap-add=NET_ADMIN --privileged --name sico \
        --mount type=volume,source=ipsec,destination=/opt/ipsec/ \
        --mount type=volume,source=frr,destination=/opt/frr/ \
        --mount type=volume,source=super,destination=/opt/super/ \
        --mount type=volume,source=super_net,destination=/opt/super_net/ \
        --mount type=volume,source=super_api,destination=/opt/super_api/ \
        --mount type=volume,source=logs,destination=/opt/logs/ \
        -e SWITCH_ADDRESS=10.69.0.10 \
        -e SWITCH_USERNAME=admin \
        -e SWITCH_PASSWORD=cisco123 \
        -e LOG_LEVEL=debug \
        --network aipsec \
        --publish 80:80 \
        --publish 443:443 \
        sico:latest

docker network connect eth1 sico
docker network connect eth2 sico

docker start sico --attach
