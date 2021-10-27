#!/usr/bin/python3
import  subprocess, sys, argparse, atexit, time

parser = argparse.ArgumentParser()
parser.add_argument('csr_vm', nargs='?', type=str, default="csr1000v-universalk9.17.03.03-serial.qcow2",
                    help='path to csr1000v-universalk9.17.03.03-serial.qcow2 image')
parser.add_argument('csr_config', nargs='?', type=str, default="csr_config.iso",
                    help='path to csr_config.iso image')
args = parser.parse_args()

build_processes = []
@atexit.register
def my_except_hook():
    for process in build_processes:
        process.terminate()


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
if csr_vm.returncode:
    csr_vm = subprocess.run('virsh -c qemu:///system destroy csr_vm; virsh -c qemu:///system undefine csr_vm', shell=True)
    csr_vm = subprocess.run(run_vm)
    if csr_vm.returncode:
        sys.exit("Unable to run CSR-VM")

build_processes.append(subprocess.Popen('exec docker build -t sico_api -f sico_api.dockerfile .', shell=True))
build_processes.append(subprocess.Popen('exec docker build -t sico_net -f sico_net.dockerfile .', shell=True))
build_processes.append(subprocess.Popen('exec docker build -t sico_test test', shell=True))
build_processes.append(subprocess.Popen('exec docker build -t sico_api_ut -f sico_api_ut.dockerfile .', shell=True))


while build_processes:
    time.sleep(1)
    for index, process in enumerate(build_processes):
        returncode = process.poll()
        if returncode is None:
            continue
        elif returncode:
            sys.exit(returncode)
        else:
            build_processes.remove(index)
            break

