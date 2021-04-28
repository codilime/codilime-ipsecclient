#!/bin/sh

service nginx start

/ipsec_backend &

sleep 3600
