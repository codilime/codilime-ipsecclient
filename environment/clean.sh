#!/bin/bash


echo "************************************"
echo "*     WARNING WARNING WARNING      *"
echo "*                                  *"
echo "* This will remove:                *"
echo "* - ALL docker images              *"
echo "* - ALL docker volumes             *"
echo "* on your system.                  *"
echo "************************************"
read -p "Are you sure? [yY]" -r REPLY
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

docker-compose down
docker assets | awk {'print $3'}|xargs docker rmi
docker volume prune -f
