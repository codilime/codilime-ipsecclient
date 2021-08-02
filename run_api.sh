#!/bin/bash

set -e

docker rm sico_api || true

docker run --name sico_api \
        --mount type=volume,source=ipsec,destination=/opt/ipsec/ \
        --mount type=volume,source=bird,destination=/opt/bird/ \
        --mount type=volume,source=super_net,destination=/opt/super_net/ \
        --mount type=volume,source=super_api,destination=/opt/super_api/ \
        --publish 80:80 \
        -e SWITCH_ADDRESS=10.5.0.10 \
        -e SWITCH_USERNAME=admin \
        -e SWITCH_PASSWORD=cisco123 \
        sico_api
