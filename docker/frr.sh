#!/bin/sh

#	Copyright (c) 2021 Cisco and/or its affiliates
#
#	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
#	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

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
