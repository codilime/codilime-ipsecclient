#!/bin/bash

# Copyright (c) 2021 Cisco and/or its affiliates
#
# This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

#eth0 - VLAN interface (Trunk) (IPSEC inside)
#eth1 - Default GW interface (DMZ)
#eth2 - MNG interface + switch config

export DEV="eth2"
MNG_TABLE=1701
# PREFIX="10.69.0.0/24"
PREFIX=`ip -j r| jq -r '.[] | select(.dev==env.DEV) | .dst'`
LOCAL_IP=`ip -j a| jq -r '.[] | select(.ifname==env.DEV) | .addr_info |.[] | select(.family=="inet") | .local'`

MNG_GW_IP=$MNG_GW_ADDRESS
SWITCH_IP=$SWITCH_ADDRESS

echo $PREFIX
echo $LOCAL_IP
echo $SWITCH_IP

ip address flush dev eth0

if [ -n "$FORCE_GW" ]; then 
    ip route del 0.0.0.0/0 2>/dev/null
    ip route add 0.0.0.0/0 via $FORCE_GW
fi

ip route del $PREFIX dev $DEV
ip rule add from $LOCAL_IP/32 table $MNG_TABLE
ip rule add to $LOCAL_IP/32 table $MNG_TABLE
if [ -n "$SWITCH_IP" ]; then 
    ip rule add to $SWITCH_IP table $MNG_TABLE pref 2000
fi
ip route add $PREFIX dev $DEV src $LOCAL_IP table $MNG_TABLE
#ip a 
#echo ip route add 0.0.0.0/0 via $MNG_GW_IP dev $DEV table $MNG_TABLE
ip route add 0.0.0.0/0 via $MNG_GW_IP dev $DEV table $MNG_TABLE

NGINX_LOCAL_IP=$LOCAL_IP exec /usr/bin/supervisord -n -c /etc/supervisord.conf
