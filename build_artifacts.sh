#!/bin/bash

set -e

rm -rf ipsec-ui/dist
rm -rf environment/ui-api/frontend
cd ipsec-ui
ng build --prod
cd ..
cp -r ipsec-ui/dist/ipsec-ui environment/ui-api/frontend

cd ipsec-backend
go build
cd ..
cp ipsec-backend/ipsec_backend environment/ui-api

