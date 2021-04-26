# Development environment

## How to build

    docker-compose build
    docker-compose up -d

## Shared volumes

There are 3 volumes shared between dockers:

- shared-ipsec
- shared-super
- shared-bird

They are used for:

1. Exporting control sockets for various daemons:

- strongswan: `shared-ipsec:/charon.vici`
- bird: `shared-bird:/bird.ctl`
- supervisor: `shared-super:/supervisord.sock`

2. Importing new config files:

- `shared-ipsec` will be mounted under `/etc/swanctl/conf.d/`. All `*.conf` files will be included by strongswan.
- `shared-bird` will be mounted under `/etc/bird.d/`. All `*.conf` files will be included by bird.
- `shared-super` will be mounted under `/etc/supervisor.d/`. All `*.ini` files will be included by supervisor.

## Shared network and pids spaces

Each site (local, remotes) is build from dockers running in shared network and process spaces. This is required to share XFRM interfaces, routing tables etc between various services.  One namespace can contain multiple VRFs and those VRFs are used to isolate traffic between configurations. VRF are used only in Local IPSEC space. Remote sites are not using VRFs at all (all is running in main network space).

## Topology diagram

![Topology](img/devenv.png "Topology diagram")
