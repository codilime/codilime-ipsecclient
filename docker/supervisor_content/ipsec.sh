#!/bin/bash

declare -a vlans_ips
i=0

for v in $VLANS_IPS; do
    vlans_ips[i]=$v
    i=$((i+1))
done

# for (( i=0; i<${#vlans_ips[@]}; i+=2 ));
# do
#   echo "${vlans_ips[$i]} ${vlans_ips[$i+1]}"
# done

logs()
  {
    echo "[VRF id: $VRF_ID]: $*"
  }

logs_err()
  {
    LOG=`cat -`
    if [ ! -z "$LOG" ]; then 
      echo -n "[VRF id: $VRF_ID]: "
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
    INTERFACE="ipsec-$VRF_ID`printf %02d $ITER`"
    logs " $INTERFACE"
    ip link del $INTERFACE 2>&1 | logs_err
    ITER=$(( $ITER + 1 ))
  done
  logs " ...done"
  logs "Removing other interfaces:"
  for (( i=0; i<${#vlans_ips[@]}; i+=2 ));
  do
    logs "vlan: ${vlans_ips[$i]}, lan ip: ${vlans_ips[$i+1]}"
    ip link del $PHYS_IF.${vlans_ips[$i]} 2>&1 | logs_err
  done
  logs " vrf-$VRF_ID"
  ip link del vrf-$VRF_ID 2>&1 | logs_err
  logs " ...done"
  # remove iptable rules
  logs "Removing iptables rules in raw table... "
  iptables -w -t raw -D PREROUTING -j VRF${VRF_ID}-raw 2>&1 | logs_err
  iptables -w -t raw -X VRF${VRF_ID}-raw 2>&1 | logs_err
  logs " ...done"
  logs "Removing iptables rules in nat table... "
  # todo: check if fails when nat was not enabled
  iptables -w -t nat -D POSTROUTING -j VRF${VRF_ID}-nat 2>&1 | logs_err
  iptables -w -t nat -X VRF${VRF_ID}-nat 2>&1 | logs_err
  logs " ...done"
  }

# catch the SIGTERM
trap _term SIGTERM

#Lets clean potenial garbage
logs "Preparing environment"
_term >/dev/null 2>&1

logs "Starting VRF $VRF_ID..."
#Create VRF
logs "Creating VRF..."
ip link add vrf-$VRF_ID type vrf table $VRF_ID 2>&1 | logs_err
ip link set dev vrf-$VRF_ID up 2>&1 | logs_err
logs " ...done"
for (( i=0; i<${#vlans_ips[@]}; i+=2 ));
do
  #Create and add tagged interface to VRF
  logs "Creating SVI interface, vlan: ${vlans_ips[$i]} lan ip: ${vlans_ips[$i+1]}"
  ip link add link $PHYS_IF name $PHYS_IF.${vlans_ips[$i]} type vlan id ${vlans_ips[$i]} 2>&1 | logs_err
  ip link set dev $PHYS_IF.${vlans_ips[$i]} master vrf-$VRF_ID 2>&1 | logs_err
  ip link set dev $PHYS_IF.${vlans_ips[$i]} up 2>&1 | logs_err
  #Assign IP
  ip address add ${vlans_ips[$i+1]} dev $PHYS_IF.${vlans_ips[$i]} 2>&1 | logs_err
  logs " ...done"
done
logs "Creating iptables rules in raw table... "
#create Zonetracks for iptables
iptables -w -t raw -N VRF${VRF_ID}-raw 2>&1 | logs_err
iptables -w -t raw -A PREROUTING -j VRF${VRF_ID}-raw 2>&1 | logs_err

iptables -w -t raw -A VRF${VRF_ID}-raw -i ipsec-${VRF_ID}+ -j CT --zone ${VRF_ID} 2>&1 | logs_err
for (( i=0; i<${#vlans_ips[@]}; i+=2 ));
do
  iptables -w -t raw -A VRF${VRF_ID}-raw -i $PHYS_IF.${vlans_ips[$i]} -j CT --zone ${VRF_ID} 2>&1 | logs_err
done
logs " ...done"
logs "Creating iptables rules in nat table... "
iptables -w -t nat -N VRF${VRF_ID}-nat 2>&1 | logs_err
iptables -w -t nat -A POSTROUTING -j VRF${VRF_ID}-nat 2>&1 | logs_err
logs " ...done"
#Create IPSEC interface and add to VRF
#ITER=$(( $VRF * 100 + 1 ))
logs "Creating ipsec interfaces:"
ITER=1
for IP in $XFRM_IP; do
  #UNIQ_ITER=$VRF`printf %02d $ITER`
  INTERFACE="ipsec-$VRF_ID`printf %02d $ITER`"
  LOCAL_IP=`echo $XFRM_IP|awk {'print $'$ITER}`
  PEER_IP=`echo $XFRM_PEER|awk {'print $'$ITER}`
  logs " $INTERFACE"
  ip link add $INTERFACE type xfrm dev lo if_id $VRF_ID`printf %02d $ITER` 2>&1 | logs_err
  ip link set dev $INTERFACE master vrf-$VRF_ID 2>&1 | logs_err
  ip link set dev $INTERFACE up 2>&1 | logs_err
  ip addr add $LOCAL_IP peer $PEER_IP dev $INTERFACE 2>&1 | logs_err
  
  if [ `echo $NAT|awk {'print $'$ITER}` == "YES" ]; then
    iptables -w -t nat -A VRF${VRF_ID}-nat -o $INTERFACE -j MASQUERADE 2>&1 | logs_err
  fi
  
  ITER=$(( $ITER + 1 ))
done 
logs " ...done"

logs "All done, wating for SIGTERM to finish"
tail -f /dev/null &

child=$!
# wait for child process to exit
wait "$child"
