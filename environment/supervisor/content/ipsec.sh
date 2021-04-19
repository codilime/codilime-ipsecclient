#!/bin/sh -e


# function to use when this script recieves a SIGTERM.
_term() {
  echo "Caught SIGTERM signal! Stopping..."
  ip link del ipsec-$VRF
  ip link del $PHYS_IF.$VRF
  ip link del vrf-$VRF
  # remove iptable rules
}

# catch the SIGTERM
trap _term SIGTERM

echo "Starting..."
#Create VRF
ip link add vrf-$VRF type vrf table $VRF
ip link set dev vrf-$VRF up
#Create and add tagged interface to VRF
ip link add link $PHYS_IF name $PHYS_IF.$VRF type vlan id $VRF
ip link set dev $PHYS_IF.$VRF master vrf-$VRF
ip link set dev $PHYS_IF.$VRF up
#Create IPSEC interface and add to VRF
ip link add ipsec-$VRF type xfrm dev lo if_id $VRF
ip link set dev ipsec-$VRF master vrf-$VRF
ip link set dev ipsec-$VRF up
ip addr add $XFRM_IP dev ipsec-$VRF

tail -f /dev/null &

child=$!
# wait for child process to exit
wait "$child"