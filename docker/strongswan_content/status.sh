#!/bin/sh

export > /tmp/plik.txt

STATUS_DIR=/opt/ipsec/status

if [ ! -d $STATUS_DIR ]; then
 mkdir -p $STATUS_DIR;
fi

echo $PLUTO_VERB > $STATUS_DIR/$1         
