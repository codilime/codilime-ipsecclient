#!/usr/bin/python3
import requests, time, subprocess, sys, urllib3, atexit

@atexit.register
def my_except_hook():
    try:
        api_process.terminate()
        net_process.terminate()
    except NameError:
        pass

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

headers = {
    'Accept': 'application/yang-data+json',
    'Content-Type': 'application/yang-data+json',
}
proposal_data = '{"proposal": {"name": "hardware","encryption": {"aes-cbc-128": [null]},"integrity": {"sha256": [null]},"prf": {"sha256": [null]},"group": {"fourteen": [null]}}}'

while True:
    try:
        response = requests.patch('https://10.69.0.10/restconf/data/Cisco-IOS-XE-native:native/crypto/ikev2/proposal', headers=headers, data=proposal_data, verify=False, auth=('admin', 'cisco123'))
        if response.status_code == 204:
            print("CSR-VM is ready")
            break
        print("Waiting for CSR-VM: " + str(response))
        time.sleep(5)
    except requests.ConnectionError:
        print("Waiting for CSR-VM: No route to CSR-VM")
        time.sleep(5)
        continue
    except Exception as e:
        print("UNKNOWN EXCEPTION")
        print(e)
        raise e

api_process = subprocess.Popen('./run_api.sh', shell=True)
net_process = subprocess.Popen('./run_net.sh', shell=True)

time.sleep(4)

if (subprocess.run('ansible-playbook ./ipsec-backend/ansible/psk/playbook.yml', shell=True).returncode or
    subprocess.run('ansible-playbook ./ipsec-backend/ansible/x509/playbook.yml', shell=True).returncode):
    subprocess.run('docker exec -it sico_api /bin/sh -c "cat /tmp/*"', shell=True)
    sys.exit(1)

subprocess.run('virsh -c qemu:///system destroy csr_vm; virsh -c qemu:///system undefine csr_vm', shell=True)
