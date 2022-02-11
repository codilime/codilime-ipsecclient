#!/bin/bash

#	Copyright (c) 2021 Cisco and/or its affiliates
#
#	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
#	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

docker network create \
               -o com.docker.network.bridge.enable_icc=true \
               -o com.docker.network.bridge.name=vlan_br \
               --driver=bridge \
               --subnet=10.68.0.0/24 \
               01_vlan_br || true

docker network create \
               -o com.docker.network.bridge.enable_icc=true \
               -o com.docker.network.bridge.name=dmz_br \
               --driver=bridge \
               --subnet=10.69.0.0/24 \
               --gateway=10.69.0.1 \
               02_dmz_br || true

docker network create \
               -o com.docker.network.bridge.enable_icc=true \
               -o com.docker.network.bridge.name=mng_br \
               --driver=bridge \
               --subnet=10.67.0.0/24 \
               03_mng_br || true
