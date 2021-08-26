#!/bin/sh

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
