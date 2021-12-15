#!/bin/bash

curl -v -H "Accept: application/yang-data+json"\
        -H "Content-Type: application/yang-data+json"\
        -k -u "admin:cisco123"\
        https://10.69.0.10/restconf/data/Cisco-IOS-XE-native:native/interface
