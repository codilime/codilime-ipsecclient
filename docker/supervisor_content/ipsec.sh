#!/bin/sh

ORG_VRF=$VRF
VRF=`printf %04d $VRF`

logs()
  {
    echo "[VRF id: $VRF]: $*"
  }

logs_err()
  {
    LOG=`cat -`
    if [ ! -z "$LOG" ]; then 
      echo -n "[VRF id: $VRF]: "
      echo $LOG
    fi
  }

# function to use when this script recieves a SIGTERM.
_term() {
  #echo "Caught SIGTERM signal! Stopping..."
  
  #ITER=$(( $VRF * 100 + 1 ))
  ITER=1
  logs "Removing ipsec interfaces:"
  for IP in $XFRM_IP; do
    INTERFACE="ipsec-$VRF`printf %02d $ITER`"
    logs " $INTERFACE"
    ip link del $INTERFACE 2>&1 | logs_err
    ITER=$(( $ITER + 1 ))
  done
  logs " ...done"
  logs "Removing other interfaces:"
  logs " $PHYS_IF.$VRF"v
  ip link del $PHYS_IF.$VRF 2>&1 | logs_err
  logs " vrf-$ORG_VRF"
  ip link del vrf-$ORG_VRF 2>&1 | logs_err
  logs " ...done"
  # remove iptable rules
  logs "Removing iptables rules in raw table... "
  iptables -w -t raw -D PREROUTING -j VRF${VRF}-raw 2>&1 | logs_err
  iptables -w -t raw -X VRF${VRF}-raw 2>&1 | logs_err
  logs " ...done"
  logs "Removing iptables rules in nat table... "
  iptables -w -t nat -D POSTROUTING -j VRF${VRF}-nat 2>&1 | logs_err
  iptables -w -t nat -X VRF${VRF}-nat 2>&1 | logs_err
  logs " ...done"
  }

# catch the SIGTERM
trap _term SIGTERM

#Lets clean potenial garbage
logs "Preaparing environment"
_term >/dev/null 2>&1

logs "Starting VRF $ORG_VRF..."
#Create VRF
logs "Creating VRF..."
ip link add vrf-$ORG_VRF type vrf table $ORG_VRF 2>&1 | logs_err
ip link set dev vrf-$ORG_VRF up 2>&1 | logs_err
logs " ...done"
#Create and add tagged interface to VRF
logs "Creating SVI interfave..."
ip link add link $PHYS_IF name $PHYS_IF.$VRF type vlan id $ORG_VRF 2>&1 | logs_err
ip link set dev $PHYS_IF.$VRF master vrf-$ORG_VRF 2>&1 | logs_err
ip link set dev $PHYS_IF.$VRF up 2>&1 | logs_err
#Assign IP
ip address add $LAN_IP dev $PHYS_IF.$VRF 2>&1 | logs_err
logs " ...done"
logs "Creating iptables rules in raw table... "
#create Zonetracks for iptables
iptables -w -t raw -N VRF${VRF}-raw 2>&1 | logs_err
iptables -w -t raw -A PREROUTING -j VRF${VRF}-raw 2>&1 | logs_err

iptables -w -t raw -A VRF${VRF}-raw -i ipsec-${VRF}+ -j CT --zone ${VRF} 2>&1 | logs_err
iptables -w -t raw -A VRF${VRF}-raw -i $PHYS_IF.$VRF -j CT --zone ${VRF} 2>&1 | logs_err
logs " ...done"
logs "Creating iptables rules in nat table... "
iptables -w -t nat -N VRF${VRF}-nat 2>&1 | logs_err
iptables -w -t nat -A POSTROUTING -j VRF${VRF}-nat 2>&1 | logs_err
logs " ...done"
#Create IPSEC interface and add to VRF
#ITER=$(( $VRF * 100 + 1 ))
logs "Creating ipsec interfaces:"
ITER=1
for IP in $XFRM_IP; do
  #UNIQ_ITER=$VRF`printf %02d $ITER`
  INTERFACE="ipsec-$VRF`printf %02d $ITER`"
  LOCAL_IP=`echo $XFRM_IP|awk {'print $'$ITER}`
  PEER_IP=`echo $XFRM_PEER|awk {'print $'$ITER}`
  logs " $INTERFACE"
  ip link add $INTERFACE type xfrm dev lo if_id $ORG_VRF`printf %02d $ITER` 2>&1 | logs_err
  ip link set dev $INTERFACE master vrf-$ORG_VRF 2>&1 | logs_err
  ip link set dev $INTERFACE up 2>&1 | logs_err
  ip addr add $LOCAL_IP peer $PEER_IP dev $INTERFACE 2>&1 | logs_err
  
  if [ `echo $NAT|awk {'print $'$ITER}` == "YES" ]; then
    iptables -w -t nat -A VRF${VRF}-nat -o $INTERFACE -j MASQUERADE 2>&1 | logs_err
  fi
  
  ITER=$(( $ITER + 1 ))
done 
logs " ...done"

logs "All done, wating for SIGTERM to finish"
tail -f /dev/null &

child=$!
# wait for child process to exit
wait "$child"
