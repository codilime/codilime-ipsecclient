from typing import cast
import requests, time, json, logging, os
from requests.auth import HTTPBasicAuth

VRFS_URL = "http://sico_api/api/vrfs"

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
        "id":1,
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
        "endpoints":[
            
        ]
    }

    r = requests.post(VRFS_URL, json=post, auth=basicAuth)
    if r.status_code >= 400:
        print(r.text)
        assert r.status_code < 400

def test_put():
    put = {
        "id":1,
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

    r = requests.put(VRFS_URL+"/1", json=put, auth=basicAuth)
    if r.status_code >= 400:
        print(r.text)
        assert r.status_code < 400

get_template="""{"id":1,"client_name":"test","vlan":123,"crypto_ph1":["aes128","sha256","modp1024"],"crypto_ph2":["aes128","sha1","modp1024"],"physical_interface":"eth0","active":true,"local_as":123,"lan_ip":"10.0.0.1","endpoints":[{"remote_ip_sec":"10.1.0.1","local_ip":"10.2.0.1","peer_ip":"10.3.0.1","authentication":{"type":"psk","psk":"asdasdasdasd","local_cert":"","remote_cert":"","private_key":""},"nat":true,"bgp":true,"remote_as":321,"source_interface":""}]}"""

def test_get():
    r = requests.get(VRFS_URL+"/1", auth=basicAuth)
    if r.status_code >= 400:
        print(r.text)
        assert r.status_code < 400
    template = json.loads(get_template)
    result = json.loads(r.text)
    if ordered(result) != ordered(template):
        print("template", template)
        print("result", result)
        assert False

def test_delete():
    r = requests.delete(VRFS_URL+"/1", auth=basicAuth)
    if r.status_code >= 400:
        print(r.text)
        assert r.status_code < 400
