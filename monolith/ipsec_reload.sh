#!/bin/sh 
#

# function to use when this script recieves a SIGTERM.
_term() {
  echo "Caught SIGTERM signal!"
  swanctl -q
}

# catch the SIGTERM
trap _term SIGTERM

echo "Starting Ipsec reload service - waiting for SIGTERM to reload Strongswan config"
tail -f /dev/null &

child=$!
# wait for child process to exit
wait "$child"

