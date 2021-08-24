#!/bin/bash

set -e

docker rm sico_net || true 
docker network create --subnet 10.69.0.0/24 sico || true

docker run --cap-add=NET_ADMIN \
        --name sico_net \
        --mount type=volume,source=ipsec,destination=/opt/ipsec/ \
        --mount type=volume,source=frr,destination=/opt/frr/ \
        --mount type=volume,source=super_net,destination=/opt/super_net/ \
        --mount type=volume,source=super_api,destination=/opt/super_api/ \
        --network sico \
        sico_net
