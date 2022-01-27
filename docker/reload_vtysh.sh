#!/bin/sh

#	Copyright (c) 2021 Cisco and/or its affiliates
#
#	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
#	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

set -e

# function to use when this script recieves a SIGTERM.
_term() {
  echo "Caught SIGTERM signal!"
  vtysh -f /opt/frr/vtysh.conf
  vtysh -w
}

# catch the SIGTERM
trap _term SIGTERM

echo "Starting vtysh running service - waiting for SIGTERM to run a vtysh file"
tail -f /dev/null &

child=$!
# wait for child process to exit
wait "$child"
