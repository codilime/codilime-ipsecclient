#!/bin/sh -e


# function to use when this script recieves a SIGTERM.
_term() {
  echo "Caught SIGTERM signal! Stopping..."
  ITER=$(( $VRF * 100 + 1 ))
  for IP in $XFRM_IP; do
    ip link del ipsec-$ITER
    ITER=$(( $ITER + 1 ))
  done
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
ITER=$(( $VRF * 100 + 1 ))
for IP in $XFRM_IP; do
  ip link add ipsec-$ITER type xfrm dev lo if_id $ITER
  ip link set dev ipsec-$ITER master vrf-$VRF
  ip link set dev ipsec-$ITER up
  ip addr add ${IP}/30 dev ipsec-$ITER
  ITER=$(( $ITER + 1 ))
done 

tail -f /dev/null &

child=$!
# wait for child process to exit
wait "$child"