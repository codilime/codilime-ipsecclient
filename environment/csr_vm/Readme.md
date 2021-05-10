# Deploying CSR1000V VM

## Prerequisites

- Working libvirt environment
- Deployed dev-env using docker-compose (VM depends on the existence of `ipsec_br` bridge)
- Downloaded image `csr1000v-universalk9.17.03.03-serial.qcow2` from Google Drive:
<https://drive.google.com/drive/u/0/folders/1DzRoXgx_d_6mwxV3_qKGrTj0hMkj-W9t>

## Create boot config

- get latest config from this repo
- execute `mkisofs -l -o csr_config.iso iosxe_config.txt`

## Deploy VM using virt-install

    virt-install                    \
        --connect=qemu:///system   \
        --name=csr_vm              \
        --os-type=linux            \
        --os-variant=rhel4.0       \
        --arch=x86_64              \
        --cpu host                 \
        --vcpus=1,sockets=1,cores=1,threads=1   \
        --hvm                      \
        --ram=4096                 \
        --import                   \
        --disk path=csr1000v-universalk9.17.03.03-serial.qcow2,bus=ide,format=qcow2   \
        --disk path=csr_config.iso,device=cdrom,bus=ide   \
        --network bridge=ipsec_br,model=virtio            \
        --nographic                                       \
        --noautoconsole

## Access VM

- `virsh console csr_vm` OR
- `ssh admin@10.5.0.10` [ password is `cisco123` ]

## Using API

*After* you log into CSR you can start using API:

`curl -H "Accept: application/yang-data+json" -k https://10.5.0.10/restconf/data/Cisco-IOS-XE-native:native/hostname -u "admin:cisco123"`
