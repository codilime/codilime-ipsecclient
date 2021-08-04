#!/bin/bash

set -e
set -x

docker stop sico_api || true && docker stop sico_net || true
docker rm sico_api || true && docker rm sico_net || true && docker rm sico_test || true
docker rmi sico_api || true && docker rmi sico_net || true && docker rmi sico_test || true

docker network rm sico || true

docker system prune -f

cd ..

docker network create --subnet 10.69.0.0/24 sico

docker build -t sico_api -f sico_api.dockerfile . && docker build -t sico_net -f sico_net.dockerfile .

docker build -t sico_test test

./run_api.sh &

./run_net.sh &

cd test

./run_test.sh
