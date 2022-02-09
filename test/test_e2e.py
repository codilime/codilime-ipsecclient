# Copyright (c) 2021 Cisco and/or its affiliates
#
# This software is licensed under the terms of the Cisco Sample Code License (CSCL)
# available here: https://developer.cisco.com/site/license/cisco-sample-code-license/

import requests, time, json, logging, os, subprocess, urllib3, pytest
from http import HTTPStatus
from deepdiff import DeepDiff

BASE_URL = "https://ipsecclient/restconf/data/ipsecclient:api"

VRFS_URL = BASE_URL + "/vrf"
SETTINGS_URL = BASE_URL + "/setting="
CHECK_SWITCH_BASIC_AUTH_URL = BASE_URL + "/check-switch-basic-auth"
CHANGE_PASS_URL = BASE_URL + "/password"
CAS_URL = BASE_URL + "/ca"
MONITORING_URL = BASE_URL + "/monitoring="

HARDWARE_VRF_ID = "1"

basicAuth = ("admin", "cisco123")

log = logging.getLogger(__name__)

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def wait_for_ipsecclient():
    while True:
        log.info("waiting for ipsecclient...")
        try:
            r = requests.get(VRFS_URL, auth=basicAuth, verify=False)
            if r.status_code < 400:
                log.info("ipsecclient is ready")
                return
            time.sleep(3)
        except:
            time.sleep(3)
            continue


def setup_module():
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    wait_for_ipsecclient()


def wait_for_csr_vm():
    headers = {
        "Accept": "application/yang-data+json",
        "Content-Type": "application/yang-data+json",
    }
    proposal_url = (
        "https://10.67.0.10/restconf/data/Cisco-IOS-XE-native:native/interface"
    )

    while True:
        try:
            response = requests.get(
                proposal_url,
                headers=headers,
                verify=False,
                auth=basicAuth,
            )
            if response.status_code == 200:
                log.info("CSR-VM is ready")
                time.sleep(3)
                return
            log.info("Waiting for CSR-VM: " + str(response))
            time.sleep(5)
        except requests.ConnectionError:
            log.info("Waiting for CSR-VM: No route to CSR-VM")
            time.sleep(5)
            continue
        except Exception as e:
            log.info("UNKNOWN EXCEPTION")
            log.info(e)
            raise e


def wait_for_dev_env():
    while (
        len(
            subprocess.run(
                r'docker -H "unix:///var/run/docker.sock" ps | grep "bird\|site"',
                shell=True,
                stdout=subprocess.PIPE,
                universal_newlines=True,
            ).stdout.split("\n")
        )
        < 9
    ):
        log.info("waiting for DEV ENV")
        time.sleep(5)

    log.info("DEV ENV is ready")
    time.sleep(1)


def _test_software_vrf(create_vrf_json):
    wait_for_dev_env()

    vrf_id = create_vrf(create_vrf_json)
    check_monitoring(vrf_id)

    delete_vrf(vrf_id)


def _test_hardware_vrf(update_vrf_json):
    wait_for_dev_env()
    wait_for_csr_vm()

    update_hardware_vrf(update_vrf_json)
    check_monitoring(HARDWARE_VRF_ID)


def test_get_algorithms_csr_vm():
    wait_for_csr_vm()
    algorithms_1 = get_algorithms()

    algorithms_2 = get_algorithms()

    assert algorithms_1.json() == algorithms_2.json(), (
        "Algorithms are not equal "
        + str(algorithms_1.json())
        + " "
        + str(algorithms_2.json())
    )


def test_psk_software():
    create_vrf_json = {
        "vrf": {
            "client_name": "test_psk",
            "vlan": [{"vlan": 123, "lan_ip": "10.0.0.0/24"}],
            "crypto_ph1": "aes128.sha256.modp2048",
            "crypto_ph2": "aes128.sha256.modp2048",
            "physical_interface": "eth0",
            "active": True,
            "disable_peer_ips": False,
            "local_as": 0,
            "ospf": False,
            "endpoint": [
                {
                    "remote_ip_sec": "10.69.0.103",
                    "local_ip": "10.0.3.1",
                    "peer_ip": "10.0.3.2",
                    "authentication": {
                        "type": "psk",
                        "psk": "Cisco-remote3",
                        "local_id": "",
                        "local_cert": "",
                        "private_key": "",
                        "remote_cert": "",
                    },
                    "nat": False,
                    "bgp": False,
                    "remote_as": 0,
                    "source_interface": "",
                },
                {
                    "remote_ip_sec": "10.69.0.104",
                    "local_ip": "10.0.4.1",
                    "peer_ip": "10.0.4.2",
                    "authentication": {
                        "type": "psk",
                        "psk": "Cisco-remote4",
                        "local_id": "",
                        "local_cert": "",
                        "private_key": "",
                        "remote_cert": "",
                    },
                    "nat": False,
                    "bgp": False,
                    "remote_as": 0,
                    "source_interface": "",
                },
            ],
        }
    }

    _test_software_vrf(create_vrf_json)


def test_psk_hardware_csr_vm():
    update_vrf_json = {
        "vrf": {
            "client_name": "hardware",
            "crypto_ph1": "aes-cbc-128.sha256.fourteen",
            "crypto_ph2": "esp-aes.esp-sha256-hmac.group14",
            "physical_interface": "eth0",
            "active": True,
            "disable_peer_ips": False,
            "local_as": 65010,
            "ospf": False,
            "endpoint": [
                {
                    "remote_ip_sec": "10.69.0.103",
                    "local_ip": "10.0.3.1",
                    "peer_ip": "10.0.3.2",
                    "authentication": {
                        "type": "psk",
                        "psk": "Cisco-remote3",
                        "local_id": "",
                        "local_cert": "",
                        "private_key": "",
                        "remote_cert": "",
                    },
                    "nat": False,
                    "bgp": True,
                    "remote_as": 65003,
                    "source_interface": "GigabitEthernet1",
                }
            ],
        }
    }

    _test_hardware_vrf(update_vrf_json)


def test_cert_software():
    with open("./ansible/x509/sw/sw_create.json") as create_vrf:
        _test_software_vrf(json.load(create_vrf))


def test_cert_hardware_csr_vm():
    with open("./ansible/x509/hw/hw.json") as update_vrf:
        _test_hardware_vrf(json.load(update_vrf))


def test_psk_local_id_software():
    with open("./ansible/psk-local-id/sw/sw_create.json") as create_vrf:
        _test_software_vrf(json.load(create_vrf))


def test_psk_local_id_hardware_csr_vm():
    with open("./ansible/psk-local-id/hw/hw.json") as update_vrf:
        _test_hardware_vrf(json.load(update_vrf))


def test_vrf_scenario():
    vrf_json = {
        "vrf": {
            "client_name": "test",
            "vlan": [{"vlan": 123, "lan_ip": "10.0.0.0/24"}],
            "crypto_ph1": "aes-cbc-128.sha256.modp_2048",
            "crypto_ph2": "esp-gcm.fourteen",
            "physical_interface": "eth0",
            "active": True,
            "disable_peer_ips": False,
            "local_as": 123,
            "ospf": False,
            "endpoint": [
                {
                    "remote_ip_sec": "10.1.0.1",
                    "local_ip": "10.2.0.1",
                    "peer_ip": "",
                    "authentication": {
                        "type": "psk",
                        "psk": "asdasdasdasd",
                        "local_id": "test@codilime.com",
                        "local_cert": "",
                        "pkcs12_base64": "",
                        "private_key": "",
                        "remote_cert": "",
                    },
                    "nat": True,
                    "bgp": False,
                    "remote_as": 321,
                    "source_interface": "",
                }
            ],
        }
    }

    vrf_id = create_vrf(vrf_json)

    vrf_json["vrf"]["id"] = int(vrf_id)
    vrf_json["vrf"]["endpoint"][0]["vrf_id"] = int(vrf_id)
    check_vrf(vrf_id, vrf_json)
    check_vrfs(vrf_id, vrf_json["vrf"])

    vrf_json["vrf"]["client_name"] = "new-name"
    vrf_json["vrf"]["crypto_ph2"] = "aes128.sha256.modp1024"
    vrf_json["vrf"]["endpoint"][0]["local_ip"] = "20.49.0.1"
    update_vrf(vrf_id, vrf_json)
    check_vrf(vrf_id, vrf_json)
    check_vrfs(vrf_id, vrf_json["vrf"])

    delete_vrf(vrf_id)
    check_deleted_vrf(vrf_id)
    check_vrfs(vrf_id, None)


def test_setting():
    setting_name = "siemka"
    setting_value_1 = "tasiemka"
    setting_value_2 = "foremka"

    set_setting(setting_name, setting_value_1)
    check_setting(setting_name, setting_value_1)

    set_setting(setting_name, setting_value_2)
    check_setting(setting_name, setting_value_2)


def test_check_switch_basic_auth_csr_vm():
    wait_for_csr_vm()

    setting_switch_username = "switch_username"
    setting_switch_pasword = "switch_password"

    switch_username = "admin"
    switch_password = "cisco123"
    wrong_switch_password = "wrongpassword"

    set_setting(setting_switch_pasword, wrong_switch_password)

    response = requests.get(CHECK_SWITCH_BASIC_AUTH_URL, auth=basicAuth, verify=False)
    check_status_code(response, HTTPStatus.OK)
    response_json = json.loads(response.text)

    assert (
        response_json["check_switch_basic_auth"] == False
    ), "Switch basic auth should not be valid"

    set_setting(setting_switch_username, switch_username)
    set_setting(setting_switch_pasword, switch_password)

    response = requests.get(CHECK_SWITCH_BASIC_AUTH_URL, auth=basicAuth, verify=False)
    check_status_code(response, HTTPStatus.OK)
    response_json = json.loads(response.text)

    assert (
        response_json["check_switch_basic_auth"] == True
    ), "Switch basic auth should be valid"


def test_set_switch_address():
    setting_switch_address = "switch_address"

    response_switch_address = requests.get(
        SETTINGS_URL + setting_switch_address, auth=basicAuth, verify=False
    )
    check_status_code(response_switch_address, HTTPStatus.OK)

    switch_address = json.loads(response_switch_address.text)["setting"]["value"]

    set_setting(setting_switch_address, "10.65.0.5")
    set_setting(setting_switch_address, switch_address)


def test_change_pass():
    new_password = "innehaslo"

    response = requests.post(
        CHANGE_PASS_URL, auth=basicAuth, json={"password": new_password}, verify=False
    )
    check_status_code(response, HTTPStatus.NO_CONTENT)

    response = requests.post(
        CHANGE_PASS_URL,
        auth=(basicAuth[0], new_password),
        json={"password": basicAuth[1]},
        verify=False,
    )
    check_status_code(response, HTTPStatus.NO_CONTENT)


def test_cas():
    cas_template = {
        "ca": [
            {"id": 1, "ca_file": "abc"},
            {"id": 2, "ca_file": "def"},
            {"id": 3, "ca_file": "ghi"},
        ]
    }
    delete_cas_template = {"ca": []}

    set_cas(cas_template)
    check_cas(cas_template)

    set_cas(delete_cas_template)
    check_cas(delete_cas_template)


def test_error_handling():
    expected_number_of_errors = 1
    expected_error_message = "masterpass cannot be used as a setting name"

    initial_number_of_errors = len(
        requests.get(BASE_URL + "/error", auth=basicAuth, verify=False).json()["error"]
    )

    response = requests.post(
        BASE_URL + "/setting=masterpass",
        data="test_value",
        auth=basicAuth,
        verify=False,
    )
    check_status_code(response, HTTPStatus.BAD_REQUEST)

    errors = requests.get(BASE_URL + "/error", auth=basicAuth, verify=False).json()[
        "error"
    ]

    number_of_errors = len(errors) - initial_number_of_errors
    error_message = errors[-1]["message"]

    assert expected_number_of_errors == number_of_errors, (
        "Expected number of errors: "
        + str(expected_number_of_errors)
        + " got: "
        + str(number_of_errors)
    )

    assert expected_error_message == error_message, (
        "Expected error message: " + expected_error_message + " got: " + error_message
    )


def test_vlans():
    vrf_json = {
        "vrf": {
            "client_name": "test",
            "vlan": [
                {"vlan": 123, "lan_ip": "10.0.0.0/24"},
                {"vlan": 123, "lan_ip": "11.0.0.0/24"},
            ],
            "crypto_ph1": "aes-cbc-128.sha256.modp_2048",
            "crypto_ph2": "esp-gcm.fourteen",
            "physical_interface": "eth0",
            "active": False,
            "local_as": 123,
            "endpoint": [],
        }
    }

    create_response = requests.post(
        VRFS_URL, json=vrf_json, auth=basicAuth, verify=False
    )
    check_status_code(create_response, HTTPStatus.BAD_REQUEST)


def test_get_source_interfaces_csr_vm():
    wait_for_csr_vm()
    source_interfaces_response = requests.get(
        BASE_URL + "/source-interface", auth=basicAuth, verify=False
    )
    check_status_code(source_interfaces_response, HTTPStatus.OK)
    source_interfaces = source_interfaces_response.json()["source_interface"]
    assert {
        "name": "GigabitEthernet1"
    } in source_interfaces, "Expected GigabitEthernet1 in the source interfaces got: " + str(
        source_interfaces
    )


@pytest.mark.skip(reason="very long execution")
def test_hardware_algorithms_csr_vm_():
    wait_for_csr_vm()
    algorithms = requests.get(BASE_URL + "/algorithm", auth=basicAuth, verify=False)
    check_status_code(algorithms, HTTPStatus.OK)
    algorithms_json = algorithms.json()["algorithm"]
    log.info(algorithms_json)
    phase1 = (
        algorithms_json["phase_1_encryption"][0]["name"]
        + "."
        + algorithms_json["phase_1_integrity"][1]["name"]
        + "."
        + algorithms_json["phase_1_key_exchange"][2]["name"]
    )
    phase2_list = get_phase2_list(algorithms_json)
    for phase2 in phase2_list:
        log.info(phase2)
        update_hardware_vrf(get_hardware_vrf_json(phase1, phase2))


def test_hardware_algorithms_csr_vm():
    wait_for_csr_vm()
    algorithms = requests.get(BASE_URL + "/algorithm", auth=basicAuth, verify=False)
    check_status_code(algorithms, HTTPStatus.OK)
    algorithms_json = algorithms.json()["algorithm"]
    log.info(algorithms_json)
    phase1 = "aes-cbc-128.md5.fifteen"
    phase2_list = [
        "esp-des.esp-sha-hmac.group19",
        "esp-gcm 192.esp-sha384-hmac.group19",
        "esp-aes 256.esp-sha384-hmac.group19",
    ]

    for phase2 in phase2_list:
        log.info(phase2)
        update_hardware_vrf(get_hardware_vrf_json(phase1, phase2))


def get_algorithms():
    algorithms = requests.get(BASE_URL + "/algorithm", auth=basicAuth, verify=False)
    check_status_code(algorithms, HTTPStatus.OK)
    return algorithms


def check_status_code(response, expected_status_code):
    assert response.status_code == expected_status_code, (
        "Expected status code to be: "
        + str(expected_status_code)
        + " got: "
        + str(response.status_code)
        + " response: "
        + response.text.replace("\\n", "\n")
    )


def get_phase2_list(algorithms):
    phase2_list = []
    key_exchange = algorithms["phase_2_key_exchange"][2]["name"]
    for encryption in algorithms["phase_2_encryption"]:
        for integrity in algorithms["phase_2_integrity"]:
            phase2_list.append(
                encryption["name"] + "." + integrity["name"] + "." + key_exchange
            )
    return phase2_list


def get_hardware_vrf_json(crypto_ph1, crypto_ph2):
    return {
        "vrf": {
            "client_name": "hardware",
            "crypto_ph1": crypto_ph1,
            "crypto_ph2": crypto_ph2,
            "physical_interface": "eth0",
            "active": True,
            "disable_peer_ips": False,
            "local_as": 65010,
            "ospf": False,
            "endpoint": [
                {
                    "remote_ip_sec": "10.100.0.100",
                    "local_ip": "10.0.5.1",
                    "peer_ip": "10.0.5.2",
                    "authentication": {
                        "type": "psk",
                        "psk": "123",
                        "local_id": "",
                        "local_cert": "",
                        "private_key": "",
                        "remote_cert": "",
                    },
                    "nat": False,
                    "bgp": True,
                    "remote_as": 65003,
                    "source_interface": "GigabitEthernet1",
                }
            ],
        }
    }


def _check_monitoring(vrf_id):
    monitoring_response = requests.get(
        MONITORING_URL + vrf_id, auth=basicAuth, verify=False
    )
    check_status_code(monitoring_response, HTTPStatus.OK)
    monitoring_response_json = monitoring_response.json()
    for endpoint in monitoring_response_json["monitoring"][0]["endpoint"]:
        if endpoint["status"] != "up":
            log.info(
                "Wrong monitoring response:%s",
                str(monitoring_response_json),
            )
            return endpoint["status"]

    return None


def check_monitoring(vrf_id):
    retries = 5
    for i in range(retries, -1, -1):
        status = _check_monitoring(vrf_id)
        if status is not None:
            if i > 0:
                log.info(
                    "monitoring_response was '%s', will retry %d more times",
                    str(status),
                    i,
                )
                time.sleep(5)
        else:
            return
    pytest.fail("Wrong monitoring response")


def create_vrf(create_vrf_json):
    create_response = requests.post(
        VRFS_URL, json=create_vrf_json, auth=basicAuth, verify=False
    )
    check_status_code(create_response, HTTPStatus.CREATED)

    return create_response.headers["Location"].split("=")[1]


def update_hardware_vrf(update_vrf_json):
    update_response = requests.patch(
        VRFS_URL + "=" + HARDWARE_VRF_ID,
        json=update_vrf_json,
        auth=basicAuth,
        verify=False,
    )
    check_status_code(update_response, HTTPStatus.NO_CONTENT)


def check_vrf_diff(expected_vrf, received_vrf):
    diff = DeepDiff(
        expected_vrf,
        received_vrf,
        ignore_order=True,
        exclude_regex_paths={r"\['endpoint'\]\[\d+\]\['id'\]"},
    )
    assert not diff, "Vrfs don't match: " + str(diff)


def check_vrf(vrf_id, expected_vrf):
    get_response = requests.get(VRFS_URL + "=" + vrf_id, auth=basicAuth, verify=False)
    check_status_code(get_response, HTTPStatus.OK)
    get_response_json = json.loads(get_response.text)

    check_vrf_diff(expected_vrf, get_response_json)


def get_vrf_by_id(vrf_list, vrf_id):
    for vrf in vrf_list:
        if vrf["id"] == int(vrf_id):
            return vrf
    return None


def check_vrfs(vrf_id, expected_vrf):
    get_vrfs_response = requests.get(VRFS_URL, auth=basicAuth, verify=False)
    check_status_code(get_vrfs_response, HTTPStatus.OK)
    get_vrfs_response_json = json.loads(get_vrfs_response.text)

    received_vrf = get_vrf_by_id(get_vrfs_response_json["vrf"], vrf_id)

    check_vrf_diff(expected_vrf, received_vrf)


def update_vrf(vrf_id, updated_vrf):
    update_response = requests.patch(
        VRFS_URL + "=" + vrf_id, json=updated_vrf, auth=basicAuth, verify=False
    )
    check_status_code(update_response, HTTPStatus.NO_CONTENT)


def delete_vrf(vrf_id):
    delete_response = requests.delete(
        VRFS_URL + "=" + vrf_id, auth=basicAuth, verify=False
    )
    check_status_code(delete_response, HTTPStatus.NO_CONTENT)


def check_deleted_vrf(vrf_id):
    get_response = requests.get(VRFS_URL + "=" + vrf_id, auth=basicAuth, verify=False)
    check_status_code(get_response, HTTPStatus.NOT_FOUND)


def set_setting(name, value):
    response = requests.post(
        SETTINGS_URL + name,
        auth=basicAuth,
        json={"setting": {"name": name, "value": value}},
        verify=False,
    )
    check_status_code(response, HTTPStatus.CREATED)


def check_setting(name, value):
    response = requests.get(SETTINGS_URL + name, auth=basicAuth, verify=False)
    check_status_code(response, HTTPStatus.OK)

    received_setting = json.loads(response.text)
    diff = DeepDiff(
        {"setting": {"name": name, "value": value}}, received_setting, ignore_order=True
    )
    assert not diff, "Settings don't match: " + str(diff)


def set_cas(cas):
    response = requests.post(CAS_URL, auth=basicAuth, json=cas, verify=False)
    check_status_code(response, HTTPStatus.NO_CONTENT)


def check_cas(expected_cas):
    response = requests.get(CAS_URL, auth=basicAuth, verify=False)
    check_status_code(response, HTTPStatus.OK)

    received_cas = json.loads(response.text)
    diff = DeepDiff(expected_cas, received_cas, ignore_order=True)
    assert not diff, "CAs don't match: " + str(diff)
