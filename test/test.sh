#!/bin/bash

set -e
set -x

docker stop sico_api || true && docker stop sico_net || true
docker rm sico_api || true && docker rm sico_net || true && docker rm sico_test || true
docker rmi sico_api || true && docker rmi sico_net || true && docker rmi sico_test || true

docker system prune -f
docker volume prune -f

cd ..

docker build -t sico_api -f sico_api.dockerfile . && docker build -t sico_net -f sico_net.dockerfile .

docker build -t sico_test test

./run_api.sh &

sleep 2

./run_net.sh &

cd test

./run_test.sh
