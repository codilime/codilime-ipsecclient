#!/bin/bash

set -e

docker stop sico || true
docker rm sico || true

# docker network rm aipsec eth1 eth2 ipsec || true
docker network rm 01_vlan_br 02_dmz_br 03_mng_br || true

docker network create \
               -o com.docker.network.bridge.enable_icc=true \
               -o com.docker.network.bridge.name=vlan_br \
               --driver=bridge \
               --subnet=10.68.0.0/24 \
               01_vlan_br || true

docker network create \
               -o com.docker.network.bridge.enable_icc=true \
               -o com.docker.network.bridge.name=dmz_br \
               --driver=bridge \
               --subnet=10.69.0.0/24 \
               02_dmz_br || true

docker network create \
               -o com.docker.network.bridge.enable_icc=true \
               -o com.docker.network.bridge.name=mng_br \
               --driver=bridge \
               --subnet=10.67.0.0/24 \
               03_mng_br || true

docker create --cap-add=NET_ADMIN --privileged --name sico \
        -e SWITCH_ADDRESS=10.67.0.10 \
        -e MNG_GW_ADDRESS=10.67.0.1 \
        -e SWITCH_USERNAME=admin \
        -e SWITCH_PASSWORD=cisco123 \
        -e LOG_LEVEL=debug \
        --network 01_vlan_br \
        --publish 80:80 \
        --publish 443:443 \
        sico:latest

#        --mount type=volume,source=ipsec,destination=/opt/ipsec/ \
#        --mount type=volume,source=frr,destination=/opt/frr/ \
#        --mount type=volume,source=super,destination=/opt/super/ \
#        --mount type=volume,source=super_net,destination=/opt/super_net/ \
#        --mount type=volume,source=super_api,destination=/opt/super_api/ \
#        --mount type=volume,source=logs,destination=/opt/logs/ \


docker network connect 02_dmz_br sico
docker network connect 03_mng_br sico

docker start sico --attach
