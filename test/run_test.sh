#!/bin/bash

set -e

docker stop sico_test || true
docker rm sico_test || true

exec docker run --name sico_test \
        --network 03_mng_br \
        -v /var/run/docker.sock:/var/run/docker.sock \
        --mount type=volume,source=logs,destination=/opt/logs/ \
        sico_test "$@"
