#!/bin/bash

set -e

docker rm sico_test || true

docker run --name sico_test \
        --network ipsec \
        --mount type=volume,source=ipsec,destination=/opt/ipsec/ \
        --mount type=volume,source=frr,destination=/opt/frr/ \
        --mount type=volume,source=super_net,destination=/opt/super_net/ \
        --mount type=volume,source=super_api,destination=/opt/super_api/ \
        -v /var/run/docker.sock:/var/run/docker.sock \
        --mount type=volume,source=logs,destination=/opt/logs/ \
        sico_test
