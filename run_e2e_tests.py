#!/usr/bin/python3
import requests, time, subprocess, sys, urllib3, atexit

app_processes = []
@atexit.register
def my_except_hook():
    for process in app_processes:
        process.terminate()

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def run_ansible_test_cases():
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

    run_app_and_check()

    if (subprocess.run('ansible-playbook ./ipsec-backend/ansible/psk/playbook.yml', shell=True).returncode or
        subprocess.run('ansible-playbook ./ipsec-backend/ansible/x509/playbook.yml', shell=True).returncode):
        subprocess.run('docker exec -it sico_api /bin/sh -c "cat /tmp/*"', shell=True)
        sys.exit(1)

    subprocess.run('virsh -c qemu:///system destroy csr_vm; virsh -c qemu:///system undefine csr_vm', shell=True)


def run_python_test_cases():
    run_app_and_check()

    subprocess.run('./test/tun_test.sh', shell=True)


def run_app_and_check():
    app_processes.append(subprocess.Popen('./run_api.sh', shell=True))
    app_processes.append(subprocess.Popen('./run_net.sh', shell=True))

    time.sleep(4) # fix this one


def terminate_app_processes():
    for process in app_processes:
        process.terminate()


def main():
    run_ansible_test_cases()
    terminate_app_processes()
    run_python_test_cases()
    terminate_app_processes()


if __name__ == "__main__":
    main()
