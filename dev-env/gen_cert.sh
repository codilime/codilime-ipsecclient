#!/bin/bash

# Copyright (c) 2021 Cisco and/or its affiliates
#
# This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

CA_DIR="CA"
UI_DIR="UI"

rm -rf $CA_DIR
rm -rf $UI_DIR

mkdir $CA_DIR

pki --gen > $CA_DIR/caKey.der
pki --self -l 3650 --in $CA_DIR/caKey.der --dn "C=CH, O=strongSwan, CN=strongSwan CA" --ca > $CA_DIR/caCert.der

certs=(1-loc 1-rem 2-loc 2-rem)
for cert in "${certs[@]}"; do

    pki --gen > $CA_DIR/peerKey-$cert.der
    pki --issue -l 3650  --in $CA_DIR/peerKey-$cert.der --type priv --cacert $CA_DIR/caCert.der --cakey $CA_DIR/caKey.der --dn "C=CH, O=strongSwan, CN=peer-$cert" > $CA_DIR/peerCert-$cert.der

    openssl rsa -inform der -outform pem -in $CA_DIR/peerKey-$cert.der -out $CA_DIR/peerKey-$cert.pem
    openssl x509 -inform der -outform pem -in $CA_DIR/peerCert-$cert.der -out $CA_DIR/peerCert-$cert.pem

done

rm strongswan/content/site1/*.pem
rm strongswan/content/site2/*.pem

cp $CA_DIR/peerKey-1-rem.pem strongswan/content/site1/
cp $CA_DIR/peerCert-1-loc.pem strongswan/content/site1/
cp $CA_DIR/peerCert-1-rem.pem strongswan/content/site1/

cp $CA_DIR/peerKey-2-rem.pem strongswan/content/site2/
cp $CA_DIR/peerCert-2-loc.pem strongswan/content/site2/
cp $CA_DIR/peerCert-2-rem.pem strongswan/content/site2/

touch strongswan/content/site3/peerCert-dummy.pem
touch strongswan/content/site3/peerKey-dummy.pem

touch strongswan/content/site4/peerCert-dummy.pem
touch strongswan/content/site4/peerKey-dummy.pem

mkdir $UI_DIR

cp $CA_DIR/peerKey-1-loc.pem $UI_DIR
cp $CA_DIR/peerCert-1-loc.pem $UI_DIR
cp $CA_DIR/peerCert-1-rem.pem $UI_DIR

cp $CA_DIR/peerKey-2-loc.pem $UI_DIR
cp $CA_DIR/peerCert-2-loc.pem $UI_DIR
cp $CA_DIR/peerCert-2-rem.pem $UI_DIR
