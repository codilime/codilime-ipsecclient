#!/bin/bash

export DEV="eth2"
MNG_TABLE=1701
# PREFIX="10.69.0.0/24"
PREFIX=`ip -j r| jq -r '.[] | select(.dev==env.DEV) | .dst'`
LOCAL_IP=`ip -j a| jq -r '.[] | select(.ifname==env.DEV) | .addr_info |.[] | select(.family=="inet") | .local'`

MNG_GW="10.69.0.1"
SWITCH_IP=$SWITCH_ADDRESS

echo $PREFIX
echo $LOCAL_IP
echo $SWITCH_IP

ip route del $PREFIX dev $DEV
ip rule add from $LOCAL_IP/32 table $MNG_TABLE
ip rule add to $LOCAL_IP/32 table $MNG_TABLE
ip rule add to $SWITCH_IP table $MNG_TABLE

ip route add $PREFIX dev $DEV src $LOCAL_IP table $MNG_TABLE
ip route add 0.0.0.0/0 via $MNG_GW dev $DEV table $MNG_TABLE

exec /usr/bin/supervisord -n -c /etc/supervisord.conf
