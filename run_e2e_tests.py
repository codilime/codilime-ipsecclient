#!/usr/bin/python3
import requests, time, subprocess, sys, urllib3, atexit

app_processes = []
@atexit.register
def my_except_hook():
    for process in app_processes:
        process.terminate()

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

basicAuth = ('admin', 'cisco123')


def main():
    run_python_test_cases()
    terminate_app_processes()
    run_ansible_test_cases()
    terminate_app_processes()


def run_python_test_cases():
    run_app()

    if subprocess.run('./test/run_test.sh', shell=True).returncode:
        subprocess.run('docker exec -it sico_api /bin/sh -c "cat /opt/logs/api.log"', shell=True)
        sys.exit(1)


def run_ansible_test_cases():
    wait_for_csr_vm()
    run_app()
    wait_for_app()

    if (subprocess.run('ansible-playbook ./ipsec-backend/ansible/psk/playbook.yml', shell=True).returncode or
        subprocess.run('ansible-playbook ./ipsec-backend/ansible/x509/playbook.yml', shell=True).returncode):
        subprocess.run('docker exec -it sico_api /bin/sh -c "cat /opt/logs/api.log"', shell=True)
        sys.exit(1)


def run_app():
    app_processes.append(subprocess.Popen('exec ./run_api.sh', shell=True))
    app_processes.append(subprocess.Popen('exec ./run_net.sh', shell=True))


def wait_for_app():
    wait_for_sico_api()
    wait_for_sico_net()


def wait_for_sico_api():
    while True:
        print("waiting for sico_api...")
        try:
            r = requests.get("http://localhost/restconf/data/sico-ipsec:api/vrf", auth=basicAuth)
            if r.status_code < 400:
                return
        except:
            time.sleep(3)
            continue


def wait_for_sico_net():
    while True:
        print("waiting for sico_net...")
        if(not subprocess.run('docker exec -it sico_net /bin/sh -c "ls \"/opt/super_net/supervisord.sock\""', shell=True).returncode and
           not subprocess.run('docker exec -it sico_net /bin/sh -c "ls \"/opt/ipsec/conf/charon.vici\""', shell=True).returncode):
            return
        time.sleep(3)


def wait_for_csr_vm():
    headers = {
        'Accept': 'application/yang-data+json',
        'Content-Type': 'application/yang-data+json',
    }
    proposal_data = '{"proposal": {"name": "hardware","encryption": {"aes-cbc-128": [null]},"integrity": {"sha256": [null]},"prf": {"sha256": [null]},"group": {"fourteen": [null]}}}'
    proposal_url = 'https://10.69.0.10/restconf/data/Cisco-IOS-XE-native:native/crypto/ikev2/proposal'

    while True:
        try:
            response = requests.patch(proposal_url, headers=headers, data=proposal_data, verify=False, auth=basicAuth)
            if response.status_code == 204:
                print("CSR-VM is ready")
                return
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


def terminate_app_processes():
    for process in app_processes:
        process.terminate()
        process.communicate()
    app_processes.clear()


if __name__ == "__main__":
    main()
