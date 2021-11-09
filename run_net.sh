#!/bin/bash

set -e

docker rm sico_net || true 

docker run --cap-add=NET_ADMIN \
        --name sico_net \
        --mount type=volume,source=ipsec,destination=/opt/ipsec/ \
        --mount type=volume,source=frr,destination=/opt/frr/ \
        --mount type=volume,source=super_net,destination=/opt/super_net/ \
        --mount type=volume,source=super_api,destination=/opt/super_api/ \
        --mount type=volume,source=logs,destination=/opt/logs/ \
        --network ipsec \
        --sysctl net.ipv6.conf.all.disable_ipv6=0 \
        --sysctl net.ipv6.conf.all.forwarding=1 \
        sico_net
