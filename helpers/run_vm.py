#!/usr/bin/python3

# 	Copyright (c) 2021 Cisco and/or its affiliates
#
# 	This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# 	available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

import argparse, subprocess, sys

parser = argparse.ArgumentParser()
parser.add_argument(
    "csr_vm",
    nargs="?",
    type=str,
    default="csr1000v-universalk9.17.03.03-serial.qcow2",
    help="path to csr1000v-universalk9.17.03.03-serial.qcow2 image",
)

parser.add_argument(
    "csr_config",
    nargs="?",
    type=str,
    default="csr_config.iso",
    help="path to csr_config.iso image",
)

args = parser.parse_args()

virt_install = """
virt-install                                    \
        --virt-type=kvm                         \
        --connect=qemu:///system                \
        --name=csr_vm                           \
        --os-type=linux                         \
        --os-variant=rhel4.0                    \
        --arch=x86_64                           \
        --cpu host                              \
        --vcpus 'sockets=1,cores=2'             \
        --hvm                                   \
        --ram=4096                              \
        --import                                \
        --disk path=%s,bus=sata,format=qcow2    \
        --disk path=%s,device=cdrom,bus=sata    \
        --network bridge=dmz_br,model=virtio  \
        --network bridge=mng_br,model=virtio  \
        --nographic                             \
        --noautoconsole
"""
virt_install = virt_install % (args.csr_vm, args.csr_config)

virt_install_ret = subprocess.run(virt_install, shell=True)
sys.exit(virt_install_ret.returncode)
