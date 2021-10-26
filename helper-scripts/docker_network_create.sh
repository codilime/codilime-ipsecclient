#!/bin/bash
docker network create \
               -o com.docker.network.bridge.enable_icc=true \
               -o com.docker.network.bridge.name=ipsec_br \
               --driver=bridge \
               --subnet=10.69.0.0/24 \
               ipsec || true
