#!/usr/bin/python3
import  subprocess, sys, argparse

parser = argparse.ArgumentParser()
parser.add_argument('csr_vm', nargs='?', type=str, default="csr1000v-universalk9.17.03.03-serial.qcow2",
                    help='path to csr1000v-universalk9.17.03.03-serial.qcow2 image')

parser.add_argument('csr_config', nargs='?', type=str, default="csr_config.iso",
                    help='path to csr_config.iso image')

args = parser.parse_args()

def my_except_hook(exctype, value, traceback):
    api_build_process.terminate()
    net_build_process.terminate()
    sys.__excepthook__(exctype, value, traceback)
sys.excepthook = my_except_hook

subprocess.run('docker stop sico_api', shell=True)
subprocess.run('docker stop sico_net', shell=True)
subprocess.run('docker stop sico_test', shell=True)

subprocess.run('docker rm sico_api', shell=True)
subprocess.run('docker rm sico_net', shell=True)
subprocess.run('docker rm sico_test', shell=True)

subprocess.run('docker rmi sico_api', shell=True)
subprocess.run('docker rmi sico_net', shell=True)
subprocess.run('docker rmi sico_test', shell=True)

subprocess.run('docker system prune -f', shell=True)
subprocess.run('docker volume prune -f', shell=True)

subprocess.run('helper-scripts/docker_network_create.sh', shell=True)

run_vm = ['./helper-scripts/run_vm.py', args.csr_vm, args.csr_config]

csr_vm = subprocess.run(run_vm)
if csr_vm.returncode == 1:
    csr_vm = subprocess.run('virsh destroy csr_vm; virsh undefine csr_vm', shell=True)
    csr_vm = subprocess.run(run_vm)
    if csr_vm.returncode == 1:
        sys.exit("csr vm unable to create")

api_build_process = subprocess.Popen('docker build -t sico_api -f sico_api.dockerfile .', shell=True)
net_build_process = subprocess.Popen('docker build -t sico_net -f sico_net.dockerfile .', shell=True)

api_build_process.communicate()
if api_build_process.returncode:
    sys.exit(api_build_process.returncode)

net_build_process.communicate()
if net_build_process.returncode:
    sys.exit(net_build_process.returncode)
