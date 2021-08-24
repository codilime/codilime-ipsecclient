#!/bin/bash

set -e

docker rm sico_net || true 

docker run --cap-add=NET_ADMIN \
        --name sico_net \
        --mount type=volume,source=ipsec,destination=/opt/ipsec/ \
        --mount type=volume,source=bird,destination=/opt/bird/ \
        --mount type=volume,source=super_net,destination=/opt/super_net/ \
        --mount type=volume,source=super_api,destination=/opt/super_api/ \
        --network ipsec \
        sico_net
