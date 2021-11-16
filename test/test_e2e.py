import requests, time, json, logging, os, subprocess, urllib3, pytest
from http import HTTPStatus
from deepdiff import DeepDiff

urllib3.disable_warnings()

BASE_URL = "https://sico_api/restconf/data/sico-ipsec:api"

VRFS_URL = BASE_URL + "/vrf"
SETTINGS_URL = BASE_URL + "/setting=siemka"
CHANGE_PASS_URL = BASE_URL + "/password"
CAS_URL = BASE_URL + "/ca"
MONITORING_URL = BASE_URL + "/monitoring="

basicAuth = ("admin", "cisco123")

log = logging.getLogger(__name__)


def wait_for_sico_api():
    while True:
        log.info("waiting for sico_api...")
        try:
            r = requests.get(VRFS_URL, auth=basicAuth, verify=False)
            if r.status_code < 400:
                return
        except:
            time.sleep(3)
            continue


def wait_for_sico_net():
    while True:
        log.info("waiting for sico_net...")
        if os.path.exists("/opt/super_net/supervisord.sock") and os.path.exists(
            "/opt/ipsec/conf/charon.vici"
        ):
            return
        time.sleep(3)


def setup_module():
    wait_for_sico_api()
    wait_for_sico_net()


def wait_for_csr_vm():
    headers = {
        "Accept": "application/yang-data+json",
        "Content-Type": "application/yang-data+json",
    }
    proposal_data = '{"proposal": {"name": "hardware","encryption": {"aes-cbc-128": [null]},"integrity": {"sha256": [null]},"prf": {"sha256": [null]},"group": {"fourteen": [null]}}}'
    proposal_url = "https://10.69.0.10/restconf/data/Cisco-IOS-XE-native:native/crypto/ikev2/proposal"

    while True:
        try:
            response = requests.patch(
                proposal_url,
                headers=headers,
                data=proposal_data,
                verify=False,
                auth=basicAuth,
            )
            if response.status_code == 204:
                log.info("CSR-VM is ready")
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


@pytest.mark.filterwarnings("ignore::urllib3.exceptions.InsecureRequestWarning")
@pytest.mark.parametrize(
    "json_file", [("./ansible/psk/hw.json"), ("./ansible/x509hw/sw_create.json")]
)
def test_hardware_vrf(json_file):
    wait_for_csr_vm()
    time.sleep(5)
    with open(json_file) as hw_file:
        hw_data = hw_file.read()
        create_response = requests.patch(VRFS_URL + "=1", data=hw_data, auth=basicAuth, verify=False)
        check_status_code(create_response, HTTPStatus.NO_CONTENT)


def test_software_vrf():
    wait_for_dev_env()

    with open("./ansible/x509/sw_create.json") as sw_create:
        sw_create_json = json.load(sw_create)

        vrf_id = create_vrf(sw_create_json)
        check_monitoring(vrf_id)

        delete_vrf(vrf_id)


def test_vrf_scenario():
    vrf_json = {
        "vrf": {
            "client_name": "test",
            "vlan": [{"vlan": 123, "lan_ip": "10.0.0.0/24"}],
            "crypto_ph1": "aes-cbc-128.sha256.modp_2048",
            "crypto_ph2": "esp-gcm.fourteen",
            "physical_interface": "eth0",
            "active": False,
            "local_as": 123,
            "endpoint": [
                {
                    "remote_ip_sec": "10.1.0.1",
                    "local_ip": "10.2.0.1",
                    "peer_ip": "10.3.0.1",
                    "authentication": {
                        "type": "psk",
                        "psk": "asdasdasdasd",
                        "local_cert": "",
                        "pkcs12_base64": "",
                        "private_key": "",
                        "remote_cert": "",
                    },
                    "nat": True,
                    "bgp": True,
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
    setting_1 = {"setting": {"name": "siemka", "value": "tasiemka"}}
    setting_2 = {"setting": {"name": "siemka", "value": "foremka"}}

    set_setting(setting_1)
    check_setting(setting_1)

    set_setting(setting_2)
    check_setting(setting_2)


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
        verify=False
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
        BASE_URL + "/setting=masterpass", data="test_value", auth=basicAuth, verify=False
    )
    check_status_code(response, HTTPStatus.BAD_REQUEST)

    errors = requests.get(BASE_URL + "/error", auth=basicAuth, verify=False).json()["error"]

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


def check_status_code(response, expected_status_code):
    assert response.status_code == expected_status_code, (
        "Expected status code to be: "
        + str(expected_status_code)
        + " got: "
        + str(response.status_code)
        + " response: "
        + response.text
    )


def check_monitoring(vrf_id):
    monitoring_response = requests.get(MONITORING_URL + vrf_id, auth=basicAuth, verify=False)
    check_status_code(monitoring_response, HTTPStatus.OK)

    try:
        assert (
            monitoring_response.json()["monitoring"][0]["endpoint"][0]["status"] == "up"
        )
    except (KeyError, IndexError) as e:
        pytest.fail("Wrong monitoring response" + e)
    except Exception as e:
        pytest.fail("unknown exception " + e)


def create_vrf(vrf_json):
    create_response = requests.post(VRFS_URL, json=vrf_json, auth=basicAuth, verify=False)
    check_status_code(create_response, HTTPStatus.CREATED)

    return create_response.headers["Location"].split("=")[1]


def check_vrf_diff(expected_vrf, received_vrf):
    diff = DeepDiff(
        expected_vrf,
        received_vrf,
        ignore_order=True,
        exclude_regex_paths={r"\['endpoint'\]\[\d+\]\['id'\]"},
    )
    assert not diff, "Vrfs don't match: " + diff


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
    delete_response = requests.delete(VRFS_URL + "=" + vrf_id, auth=basicAuth, verify=False)
    check_status_code(delete_response, HTTPStatus.NO_CONTENT)


def check_deleted_vrf(vrf_id):
    get_response = requests.get(VRFS_URL + "=" + vrf_id, auth=basicAuth, verify=False)
    check_status_code(get_response, HTTPStatus.NOT_FOUND)


def set_setting(setting):
    response = requests.post(SETTINGS_URL, auth=basicAuth, json=setting, verify=False)
    check_status_code(response, HTTPStatus.CREATED)


def check_setting(expected_setting):
    response = requests.get(SETTINGS_URL, auth=basicAuth, verify=False)
    check_status_code(response, HTTPStatus.OK)

    received_setting = json.loads(response.text)
    diff = DeepDiff(expected_setting, received_setting, ignore_order=True)
    assert not diff, "Settings don't match: " + diff


def set_cas(cas):
    response = requests.post(CAS_URL, auth=basicAuth, json=cas, verify=False)
    check_status_code(response, HTTPStatus.NO_CONTENT)


def check_cas(expected_cas):
    response = requests.get(CAS_URL, auth=basicAuth, verify=False)
    check_status_code(response, HTTPStatus.OK)

    received_cas = json.loads(response.text)
    diff = DeepDiff(expected_cas, received_cas, ignore_order=True)
    assert not diff, "CAs don't match: " + diff

