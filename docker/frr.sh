#!/bin/sh

_term() {
  #Stop FRR
  /usr/lib/frr/frrinit.sh stop
  }

# catch the SIGTERM
trap _term SIGTERM

#Start FRR
/usr/lib/frr/frrinit.sh start

tail -f /dev/null &

child=$!
# wait for child process to exit
wait "$child"
