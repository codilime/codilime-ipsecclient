#!/usr/bin/python3
import argparse, subprocess, sys

parser = argparse.ArgumentParser()
parser.add_argument('csr_vm', nargs='?', type=str, default="csr1000v-universalk9.17.03.03-serial.qcow2",
                    help='path to csr1000v-universalk9.17.03.03-serial.qcow2 image')

parser.add_argument('csr_config', nargs='?', type=str, default="csr_config.iso",
                    help='path to csr_config.iso image')

args = parser.parse_args()

virt_install = '''
virt-install                                    \
        --virt-type=kvm                         \
        --connect=qemu:///system                \
        --name=csr_vm                           \
        --os-type=linux                         \
        --os-variant=rhel4.0                    \
        --arch=x86_64                           \
        --cpu host                              \
        --vcpus=1,sockets=1,cores=1,threads=1   \
        --hvm                                   \
        --ram=4096                              \
        --import                                \
        --disk path=%s,bus=sata,format=qcow2    \
        --disk path=%s,device=cdrom,bus=sata    \
        --network bridge=ipsec_br,model=virtio  \
        --nographic                             \
        --noautoconsole
'''
virt_install = virt_install % (args.csr_vm, args.csr_config)

virt_install_ret = subprocess.run(virt_install, shell=True)
sys.exit(virt_install_ret.returncode)
