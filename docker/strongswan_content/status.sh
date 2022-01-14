#!/bin/bash

#	Copyright (c) 2021 Cisco and/or its affiliates
#
#	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
#	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

export > /tmp/plik.txt

STATUS_DIR=/opt/ipsec/status

if [ ! -d $STATUS_DIR ]; then
 mkdir -p $STATUS_DIR;
fi

echo $PLUTO_VERB > $STATUS_DIR/$1         
