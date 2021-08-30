#!/bin/bash

set -e
set -x

# clean the system from before tests

virsh destroy csr_vm || true
virsh undefine csr_vm || true
docker stop sico_api || true && docker stop sico_net || true
docker rm sico_api || true && docker rm sico_net || true && docker rm sico_test || true
docker rmi sico_api || true && docker rmi sico_net || true && docker rmi sico_test || true

docker system prune -f

# configure the csr_vm

if [ -d /opt/csr_vm ]; then
    echo "the vm directory already exists"
else
    pushd .
    sudo mkdir /opt/csr_vm
    sudo chmod -R 777 /opt/csr_vm
    cd /opt/csr_vm
    gdown https://drive.google.com/uc?id=1zURdKGkXUMwSTeYDNPT_jEGlNMlJDXFK
    7z x -pFKW9kCFTsWRuCqDPlC1LgUF5cWJEGZcG csr_vm.7z
    popd
fi

cd ..

# build dockers

docker build -t sico_api -f sico_api.dockerfile . && docker build -t sico_net -f sico_net.dockerfile .

docker build -t sico_test test

# run the system

./run_api.sh &

sleep 2

./run_net.sh &

pushd .

cd /opt/csr_vm/csr_vm
./run_vm.sh & # can't run vm earlier because run_api.sh creates the network

popd

# todo: wait for the vm to come online
set +e
ping -c 3 10.69.0.10
while test $? -gt 0
do
   sleep 5
   ping -c 3 10.69.0.10
done

cd test

# run the tests

./run_test.sh
