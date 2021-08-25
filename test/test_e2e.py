from typing import cast
import requests, time
from requests.auth import HTTPBasicAuth

VRFS_URL = "http://sico_api/api/vrfs"

basicAuth=HTTPBasicAuth("admin", "cisco123")

def setup_module():
    while True:
        print("waiting for sico_api...")
        try:
            r = requests.get(VRFS_URL, auth=basicAuth)
            if r.status_code < 400:
                return
        except:
            time.sleep(3)
            continue

def test_post():
    post = {
        "id":1,
        "client_name":"test",
        "vlan":123,
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
    if r.status_code < 400:
        print(r.text)
        assert r.status_code < 400

def test_put():
    put = {
        "id":1,
        "client_name":"test",
        "vlan":123,
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
                "psk":"asdasdasdasd",
                "nat":True,
                "bgp":True,
                "remote_as":321,
                "hover":False,
                "source_interface":""
            }
        ]
    }

    r = requests.put(VRFS_URL+"/1", json=put, auth=basicAuth)
    if r.status_code < 400:
        print(r.text)
        assert r.status_code < 400

def test_get():
    r = requests.get(VRFS_URL+"/1", auth=basicAuth)
    if r.status_code < 400:
        print(r.text)
        assert r.status_code < 400
    assert r.text=="""{"id":1,"client_name":"test","vlan":123,"crypto_ph1":["aes128","sha256","modp1024"],"crypto_ph2":["aes128","sha1","modp1024"],"physical_interface":"eth0","active":true,"local_as":123,"lan_ip":"10.0.0.1","endpoints":[{"remote_ip_sec":"10.1.0.1","local_ip":"10.2.0.1","peer_ip":"10.3.0.1","psk":"asdasdasdasd","nat":true,"bgp":true,"remote_as":321,"hover":false,"source_interface":""}]}"""

def test_delete():
    r = requests.delete(VRFS_URL+"/1", auth=basicAuth)
    if r.status_code < 400:
        print(r.text)
        assert r.status_code < 400
