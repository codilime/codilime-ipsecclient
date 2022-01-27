#!/bin/bash

# Copyright (c) 2021 Cisco and/or its affiliates
#
# This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

set -e

docker stop sico_test || true
docker rm sico_test || true

exec docker run --name sico_test \
        --network 03_mng_br \
        -v /var/run/docker.sock:/var/run/docker.sock \
        --mount type=volume,source=logs,destination=/opt/logs/ \
        sico_test "$@"
