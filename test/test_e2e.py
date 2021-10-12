from typing import cast
import requests, time, json, logging, os, subprocess
from requests.auth import HTTPBasicAuth

BASE_URL = "http://sico_api"

VRFS_URL = BASE_URL + "/api/vrfs"
SETTINGS_URL = BASE_URL + "/api/settings/test_setting"
CHANGE_PASS_URL = BASE_URL + "/api/changepass"
CAS_URL = BASE_URL + "/api/cas"

basicAuth=HTTPBasicAuth("admin", "cisco123")

log = logging.getLogger(__name__)

def wait_for_sico_api():
    while True:
        print("waiting for sico_api...")
        try:
            r = requests.get(VRFS_URL, auth=basicAuth)
            if r.status_code < 400:
                return
        except:
            time.sleep(3)
            continue

def wait_for_sico_net():
    while True:
        print("waiting for sico_net...")
        if os.path.exists("/opt/super_net/supervisord.sock") and \
            os.path.exists("/opt/ipsec/conf/charon.vici"):
            return
        time.sleep(3)

def setup_module():
    wait_for_sico_api()
    wait_for_sico_net()

def ordered(obj):
    if isinstance(obj, dict):
        return sorted((k, ordered(v)) for k, v in obj.items())
    if isinstance(obj, list):
        return sorted(ordered(x) for x in obj)
    else:
        return obj

def test_post():
    post = {
        "id":2,
        "client_name":"test",
        "vlans":[
            {
                "vlan": 123,
                "lan_ip": "10.0.0.0/24"
            }
        ],
        "crypto_ph1":[
            "aes-cbc-128",
            "sha256",
            "modp_2048"
        ],
        "crypto_ph2":[
            "esp-gcm",
            "fourteen"
        ],
        "physical_interface":"eth0",
        "active":False,
        "hardware_support":False,
        "local_as":123,
        "lan_ip":"10.0.0.1",
    }

    r = requests.post(VRFS_URL, json=post, auth=basicAuth)
    if r.status_code >= 400:
        print(r.text)
        assert r.status_code < 400

def test_put():
    put = {
        "id":2,
        "client_name":"test",
        "vlans":[
            {
                "vlan": 123,
                "lan_ip": "10.0.0.0/24"
            }
        ],
        "crypto_ph1":[
            "aes128",
            "sha256",
            "modp1024"
        ],
        "crypto_ph2":[
            "aes128",
            "sha1",
            "modp1024"
        ],
        "physical_interface":"eth0",
        "active":True,
        "hardware_support":False,
        "local_as":123,
        "lan_ip":"10.0.0.1",
        "endpoints":[
            {
                "remote_ip_sec":"10.1.0.1",
                "local_ip":"10.2.0.1",
                "peer_ip":"10.3.0.1",
                "authentication": {
                    "type": "psk",
                    "psk": "asdasdasdasd"
                },
                "nat":True,
                "bgp":True,
                "remote_as":321,
                "source_interface":""
            }
        ]
    }

    r = requests.put(VRFS_URL+"/2", json=put, auth=basicAuth)
    if r.status_code >= 400:
        print(r.text)
        assert r.status_code < 400

get_template = {
    "id": 2,
    "client_name": "test",
    'vlans': [
        {
            'vlan': 123,
            'lan_ip': '10.0.0.0/24'
        }
    ],
    "crypto_ph1": ["aes128", "sha256", "modp1024"],
    "crypto_ph2": ["aes128", "sha1", "modp1024"],
    "physical_interface": "eth0",
    "active": True,
    "local_as": 123,
    "endpoints": [
        {
            "id": 1,
            "vrf_id": 2,
            "remote_ip_sec": "10.1.0.1",
            "local_ip": "10.2.0.1",
            "peer_ip": "10.3.0.1",
            "authentication": {
                "type": "psk",
                "psk": "asdasdasdasd",
                "local_cert": "",
                "remote_cert": "",
                "private_key": "",
            },
            "nat": True,
            "bgp": True,
            "remote_as": 321,
            "source_interface": "",
        }
    ],
}


def test_get():
    r = requests.get(VRFS_URL+"/2", auth=basicAuth)
    if r.status_code >= 400:
        print(r.text)
        assert r.status_code < 400
    result = json.loads(r.text)
    if ordered(result) != ordered(get_template):
        log.error(get_template)
        log.error(result)
        assert False

def test_delete():
    r = requests.delete(VRFS_URL+"/2", auth=basicAuth)
    if r.status_code >= 400:
        print(r.text)
        assert r.status_code < 400

def test_setting():
    r = requests.post(SETTINGS_URL, auth=basicAuth, data="test_value")
    if r.status_code >= 400:
        log.error(r.text)
        assert r.status_code < 400
    
    r = requests.post(SETTINGS_URL, auth=basicAuth, data="other_test_value")
    if r.status_code >= 400:
        log.error(r.text)
        assert r.status_code < 400
    
    r = requests.get(SETTINGS_URL, auth=basicAuth)
    if r.status_code >= 400:
        log.error(r.text)
        assert r.status_code < 400
    j = json.loads(r.text)
    assert j["value"] == "other_test_value"

def test_change_pass():
    r = requests.post(CHANGE_PASS_URL, auth=basicAuth, data="innehaslo")
    if r.status_code >= 400:
        log.error(r.text)
        assert r.status_code < 400

    r = requests.post(CHANGE_PASS_URL, auth=HTTPBasicAuth("admin", "innehaslo"), data="cisco123")
    if r.status_code >= 400:
        log.error(r.text)
        assert r.status_code < 400


def test_cas():
    r = requests.post(CAS_URL, auth=basicAuth, json=[
        {"CA": "123"},
        {"CA": "456"},
        {"CA": "789"},
    ])
    if r.status_code >= 400:
        log.error(r.text)
        assert r.status_code < 400
    
    r = requests.get(CAS_URL, auth=basicAuth)
    if r.status_code >= 400:
        log.error(r.text)
        assert r.status_code < 400

    j = json.loads(r.text)
    assert ordered(j) == ordered([
        {"CA": "123", "ID": 1},
        {"CA": "456", "ID": 2},
        {"CA": "789", "ID": 3}
    ])

    r = requests.post(CAS_URL, auth=basicAuth, json=[])
    if r.status_code >= 400:
        log.error(r.text)
        assert r.status_code < 400
    
    r = requests.get(CAS_URL, auth=basicAuth)
    if r.status_code >= 400:
        log.error(r.text)
        assert r.status_code < 400

    j = json.loads(r.text)
    assert ordered(j) == ordered([])

def test_error_handling():
    expected_status_code = 400
    expected_number_of_errors = 1
    expected_error_message = "masterpass cannot be used as a setting name"

    initial_number_of_errors = len(get_errors_from_database())

    r = requests.post(BASE_URL + "/api/settings/masterpass", data="test_value", auth=basicAuth)
    assert r.status_code == expected_status_code

    errors = get_errors_from_database()

    number_of_errors = len(errors)
    assert number_of_errors - initial_number_of_errors == expected_number_of_errors

    error_message = errors[-2].split('|')[1]
    assert error_message == expected_error_message

def get_errors_from_database():
    return subprocess.run(
        'docker -H \"unix:///var/run/docker.sock\" exec sico_api /bin/sh -c \"sqlite3 /iox_data/appdata/ipsec.db \'select * from stored_errors;\'\"',
        shell=True,
        check=True,
        stdout=subprocess.PIPE,
        universal_newlines=True).stdout.split('\n')
