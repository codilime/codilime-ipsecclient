#!/bin/bash

#	Copyright (c) 2021 Cisco and/or its affiliates
#
#	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
#	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

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

