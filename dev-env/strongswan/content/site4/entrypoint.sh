#!/bin/sh -e

# Copyright (c) 2021 Cisco and/or its affiliates
#
# This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

# entrypoint for strongswan

# enable ip forward
sysctl -w net.ipv4.ip_forward=1

IF_ID=100
XFRM_IP=10.0.4.2/30
LO_IP=100.65.0.4/32

ip link add ipsec type xfrm dev lo if_id $IF_ID
ip link set up ipsec
ip addr add $XFRM_IP dev ipsec
ip addr add $LO_IP dev lo

# function to use when this script recieves a SIGTERM.
_term() {
  echo "Caught SIGTERM signal! Stopping ipsec..."
  #kill -TERM "$child" 2>/dev/null
  ipsec stop
  # remove iptable rules
}

# catch the SIGTERM
trap _term SIGTERM

echo "Starting strongSwan/ipsec..."
ipsec start --nofork "$@" &

child=$!
# wait for child process to exit
wait "$child"
