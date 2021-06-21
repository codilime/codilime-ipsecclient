#!/bin/sh

DIR="/etc/nginx/conf.d/"

iptables -P INPUT ACCEPT
iptables -F
iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -p udp --dport 500 -j ACCEPT
iptables -A INPUT -p udp --dport 4500 -j ACCEPT
iptables -A INPUT -i eth1 -j ACCEPT
iptables -A INPUT -i eth0 -j ACCEPT
iptables -A INPUT -i ipsec+ -j ACCEPT
iptables -A INPUT -i vrf+ -j ACCEPT

iptables -P INPUT DROP
iptables -P FORWARD ACCEPT
iptables -P OUTPUT ACCEPT

MGT_IP=`ip -4 -json addr|jq -r '.[] | select(.ifname=="eth1") | .addr_info| .[].local'`
MGT_GW=`ip -4 -json route |jq -r '.[] | select(.dev=="eth1" and .dst=="default") | .gateway'`

ping -c 5 $MGT_GW 2> /dev/null

ip route del 0.0.0.0/0 via $MGT_GW
ip route add 0.0.0.0/0 via $MGT_GW table 10000

ip rule add to $MGT_IP/32 table 10000
ip rule add from $MGT_IP/32 table 10000


for file in $DIR/*.template; do
    envsubst < $file > $DIR/`basename $file .template`
done

nginx -g 'daemon off;'