#!/bin/bash

set -e

docker rm sico_test || true

docker run --name sico_test \
        --network ipsec \
        sico_test
