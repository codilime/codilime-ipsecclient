#!/bin/bash

# Copyright (c) 2021 Cisco and/or its affiliates
#
# This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

set -e

docker stop ipsecclient || true
docker rm ipsecclient || true

# docker network rm 01_vlan_br 02_dmz_br 03_mng_br || true

./helpers/docker_network_create.sh

docker create --cap-add=NET_ADMIN --privileged --name ipsecclient \
        -e SWITCH_ADDRESS=10.67.0.10 \
        -e MNG_GW_ADDRESS=10.67.0.1 \
        -e SWITCH_USERNAME=admin \
        -e SWITCH_PASSWORD=cisco123 \
        -e FORCE_GW=10.69.0.1 \
        -e LOG_LEVEL=debug \
        --network 01_vlan_br \
        --publish 80:80 \
        --publish 443:443 \
        ipsecclient:latest

#        --mount type=volume,source=ipsec,destination=/opt/ipsec/ \
#        --mount type=volume,source=frr,destination=/opt/frr/ \
#        --mount type=volume,source=super,destination=/opt/super/ \
#        --mount type=volume,source=super_net,destination=/opt/super_net/ \
#        --mount type=volume,source=super_api,destination=/opt/super_api/ \
#        --mount type=volume,source=logs,destination=/opt/logs/ \


docker network connect 02_dmz_br ipsecclient
docker network connect 03_mng_br ipsecclient

exec docker start ipsecclient --attach
