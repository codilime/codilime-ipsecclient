#!/bin/sh -e

ORG_VRF=$VRF
VRF=`printf %04d $VRF`


# function to use when this script recieves a SIGTERM.
_term() {
  echo "Caught SIGTERM signal! Stopping..."
  
  #ITER=$(( $VRF * 100 + 1 ))
  ITER=1

  for IP in $XFRM_IP; do
    INTERFACE="ipsec-$VRF`printf %02d $ITER`"
    ip link del $INTERFACE
    ITER=$(( $ITER + 1 ))
  done
  ip link del $PHYS_IF.$VRF
  ip link del vrf-$ORG_VRF
  # remove iptable rules
  iptables -w -t raw -X VRF${VRF}-raw
  iptables -w -t raw -D PREROUTING -j VRF${VRF}-raw

  iptables -w -t nat -X VRF${VRF}-nat
  iptables -w -t nat -D POSTROUTING -j VRF${VRF}-nat
}

# catch the SIGTERM
trap _term SIGTERM

echo "Starting VRF $ORG_VRF..."
#Create VRF
ip link add vrf-$ORG_VRF type vrf table $ORG_VRF
ip link set dev vrf-$ORG_VRF up
#Create and add tagged interface to VRF
ip link add link $PHYS_IF name $PHYS_IF.$VRF type vlan id $ORG_VRF
ip link set dev $PHYS_IF.$VRF master vrf-$ORG_VRF
ip link set dev $PHYS_IF.$VRF up

#create Zonetracks for iptables
iptables -w -t raw -N VRF${VRF}-raw
iptables -w -t raw -A PREROUTING -j VRF${VRF}-raw

iptables -w -t raw -A VRF${VRF}-raw -i ipsec-${VRF}+ -j CT --zone ${VRF}
iptables -w -t raw -A VRF${VRF}-raw -i $PHYS_IF.$VRF -j CT --zone ${VRF}

iptables -w -t nat -N VRF${VRF}-nat
iptables -w -t nat -A POSTROUTING -j VRF${VRF}-nat

#Create IPSEC interface and add to VRF
#ITER=$(( $VRF * 100 + 1 ))
ITER=1
for IP in $XFRM_IP; do
  #UNIQ_ITER=$VRF`printf %02d $ITER`
  INTERFACE="ipsec-$VRF`printf %02d $ITER`"
  LOCAL_IP=`echo $XFRM_IP|awk {'print $'$ITER}`
  PEER_IP=`echo $XFRM_PEER|awk {'print $'$ITER}`
  
  ip link add $INTERFACE type xfrm dev lo if_id $ORG_VRF`printf %02d $ITER`
  ip link set dev $INTERFACE master vrf-$ORG_VRF
  ip link set dev $INTERFACE up
  ip addr add $LOCAL_IP peer $PEER_IP dev $INTERFACE
  
  if [ `echo $NAT|awk {'print $'$ITER}` == "Yes" ]; then
    iptables -w -t nat -A VRF${VRF}-nat -o $INTERFACE -j MASQUERADE
  fi
  
  ITER=$(( $ITER + 1 ))
done 

tail -f /dev/null &

child=$!
# wait for child process to exit
wait "$child"