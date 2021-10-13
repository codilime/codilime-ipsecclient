#!/bin/bash

set -e

docker rm sico_api_ut || true

docker run --name sico_api_ut \
        --mount type=volume,source=ipsec,destination=/opt/ipsec/ \
        --mount type=volume,source=frr,destination=/opt/frr/ \
        --mount type=volume,source=super_net,destination=/opt/super_net/ \
        --mount type=volume,source=super_api,destination=/opt/super_api/ \
        sico_api_ut
