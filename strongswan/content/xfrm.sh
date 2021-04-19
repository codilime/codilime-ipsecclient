#!/bin/sh

XFRM_IP=$1
IF_ID=$2

ip link add ipsec type xfrm dev lo if_id $IF_ID
ip link set up ipsec
ip addr add $XFRM_IP dev ipsec
