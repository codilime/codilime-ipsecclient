from typing import cast
import requests
import time
import json
import logging
import os
from requests.auth import HTTPBasicAuth
import pytest

BASE_URL = "http://sico_api/restconf/data/sico-ipsec:api"

VRFS_URL = BASE_URL + "/vrf"
SETTINGS_URL = BASE_URL + "/setting=test_setting"
CHANGE_PASS_URL = BASE_URL + "/password"
CAS_URL = BASE_URL + "/ca"

basicAuth = HTTPBasicAuth("admin", "cisco123")

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
        "vrf": {
            "id": 2,
            "client_name": "test",
            "vlan": [
                {
                    "vlan": 123,
                    "lan_ip": "10.0.0.0/24"
                }
            ],
            "crypto_ph1": "aes-cbc-128.sha256.modp_2048",
            "crypto_ph2": "esp-gcm.fourteen",
            "physical_interface": "eth0",
            "active": False,
            "local_as": 123,
        }
    }

    r = requests.post(VRFS_URL, json=post, auth=basicAuth)
    if r.status_code >= 400:
        print(r.text)
        assert r.status_code < 400


def test_patch():
    patch = {
        "vrf": {
            "id": 2,
            "client_name": "test",
            "vlan": [
                {
                    "vlan": 123,
                    "lan_ip": "10.0.0.0/24"
                }
            ],
            "crypto_ph1": "aes128.sha256.modp1024",
            "crypto_ph2": "aes128.sha256.modp1024",
            "physical_interface": "eth0",
            "active": True,
            "local_as": 123,
            "endpoint": [
                {
                    "id": 1,
                    "vrf_id": 2,
                    "remote_ip_sec": "10.1.0.1",
                    "local_ip": "10.2.0.1",
                    "peer_ip": "10.3.0.1",
                    "authentication": {
                        "type": "psk",
                        "psk": "asdasdasdasd"
                    },
                    "nat": True,
                    "bgp": True,
                    "remote_as": 321,
                    "source_interface": ""
                }
            ]
        }
    }

    r = requests.patch(VRFS_URL+"=2", json=patch, auth=basicAuth)
    if r.status_code >= 400:
        print(r.text)
        assert r.status_code < 400


get_template = {
    "vrf": {
        "active": True,
        "client_name": "test",
        "crypto_ph1": "aes128.sha256.modp1024",
        "crypto_ph2": "aes128.sha256.modp1024",
        
        "endpoint": [
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
        "id": 2,
        "local_as": 123,
        "physical_interface": "eth0",
        "vlan": [{
                "lan_ip": "10.0.0.0/24",
                "vlan": 123
            }],
    }
}


def test_get():
    r = requests.get(VRFS_URL+"=2", auth=basicAuth)
    if r.status_code >= 400:
        print(r.text)
        assert r.status_code < 400
    result = json.loads(r.text)
    if ordered(result) != ordered(get_template):
        log.error(json.dumps(get_template, indent=4, sort_keys=True))
        log.error(json.dumps(result, indent=4, sort_keys=True))
        assert False


def test_delete():
    r = requests.delete(VRFS_URL+"=2", auth=basicAuth)
    if r.status_code >= 400:
        print(r.text)
        assert r.status_code < 400


@pytest.mark.skip
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


@pytest.mark.skip
def test_change_pass():
    r = requests.post(CHANGE_PASS_URL, auth=basicAuth, data="innehaslo")
    if r.status_code >= 400:
        log.error(r.text)
        assert r.status_code < 400

    r = requests.post(CHANGE_PASS_URL, auth=HTTPBasicAuth(
        "admin", "innehaslo"), data="cisco123")
    if r.status_code >= 400:
        log.error(r.text)
        assert r.status_code < 400


@pytest.mark.skip
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
