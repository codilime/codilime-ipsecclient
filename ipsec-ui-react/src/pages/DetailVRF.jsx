import React, { useState, useEffect } from "react";

import { useHistory, useParams } from "react-router";

import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import "./DetailVRF.scss";
import "./NewVRF.scss";

import EndpointTableRow from "../components/EndpointTableRow";
import NewEndpointRow from "../components/NewEndpointRow";
import Button from "../components/Button";

import Dump from "../components/Dump";
import { isEmptyObject } from "../util";

export default function DetailViewVrf(props) {
    const { id } = useParams();
    const history = useHistory();

    const detailApiAddress = "/api/vrfs/" + id;
    const {
        softwareEncryption,
        hardwarePh1Encryption,
        hardwarePh2Encryption,
        updateSidebar,
        renderTableHeadersForHardwareSupport,
        renderTableHeadersForSoftwareSupport,
        maxValueForLocal_as,
    } = props;

    const [detailVrf, updateDetailVrf] = useState();
    const [loading, updateLoading] = useState(true);

    const [vrfName, updateVrfName] = useState(vrfName);
    const [lanIpMask, updateLanIpMask] = useState(lanIpMask);
    const [physicalInterface, updatePhysicalInterface] = useState(physicalInterface);
    const [active, updateActive] = useState(active);
    const [hardwareSupport, updateHardwareSupport] = useState(hardwareSupport);
    const [vlanValue, updateVlanValue] = useState(vlanValue);
    const [bgpValue, updateBgpValue] = useState(bgpValue);
    const [cryptoPh1_1, updateCryptoPh1_1] = useState(cryptoPh1_1);
    const [cryptoPh1_2, updateCryptoPh1_2] = useState(cryptoPh1_2);
    const [cryptoPh1_3, updateCryptoPh1_3] = useState(cryptoPh1_3);
    const [cryptoPh2_1, updateCryptoPh2_1] = useState(cryptoPh2_1);
    const [cryptoPh2_2, updateCryptoPh2_2] = useState(cryptoPh2_2);
    const [cryptoPh2_3, updateCryptoPh2_3] = useState(cryptoPh2_3);

    const [arrayForCryptoPh1, updateArrayForCryptoPh1] = useState([]);
    const [arrayForCryptoPh2, updateArrayForCryptoPh2] = useState([]);

    function updateDefaultPh1EncryptionData() {
        console.log(
            "update",
            hardwareSupport,
            hardwarePh1Encryption,
            softwareEncryption
        );
        if (hardwareSupport === true) {
            updateArrayForCryptoPh1(hardwarePh1Encryption);
        } else {
            updateArrayForCryptoPh1(softwareEncryption);
        }
    }

    function updateDefaultPh2EncryptionData() {
        if (hardwareSupport === true) {
            updateArrayForCryptoPh2(hardwarePh2Encryption);
        } else {
            updateArrayForCryptoPh2(softwareEncryption);
        }
    }

    useEffect(() => {
        updateDefaultPh1EncryptionData();
        updateDefaultPh2EncryptionData();
    }, [
        hardwarePh1Encryption,
        hardwarePh2Encryption,
        softwareEncryption,
        hardwareSupport,
    ]);

    async function fetchThisVrfDetails() {
        const response = await axios.get(detailApiAddress);

        let data = response.data;

        if (data && !isEmptyObject(data)) {
            updateDetailVrf(data);
            updateVrfName(data.client_name);
            updateLanIpMask(data.lan_ip);
            updatePhysicalInterface(data.physical_interface);
            updateActive(data.active);
            updateHardwareSupport(data.hardware_support);
            updateVlanValue(data.vlan);
            updateBgpValue(data.local_as);
            updateCryptoPh1_1(data.crypto_ph1[0]);
            updateCryptoPh1_2(data.crypto_ph1[1]);
            updateCryptoPh1_3(data.crypto_ph1[2]);
            updateCryptoPh2_1(data.crypto_ph2[0]);
            updateCryptoPh2_2(data.crypto_ph2[1]);
            updateCryptoPh2_3(data.crypto_ph2[2]);
        } else {
            alert("no data available");
        }
    }

    useEffect(() => {
        fetchThisVrfDetails().then(() => updateLoading(false));
    }, [id]);

    if (loading === true) {
        return <div>fetching data, please wait</div>;
    }

    const payload = {
        client_name: vrfName,
        lan_ip: lanIpMask,
        active: active,
        vlan: parseInt(vlanValue, 10),
        crypto_ph1: [cryptoPh1_1, cryptoPh1_2, cryptoPh1_3],
        crypto_ph2: [cryptoPh2_1, cryptoPh2_2, cryptoPh2_3],
        physical_interface: physicalInterface,
        hardware_support: hardwareSupport,
        local_as: parseInt(bgpValue, 10),
        endpoints: detailVrf.endpoints,
    };

    function updateVrfConnection(event) {
        event.preventDefault();
        axios({
            method: "put",
            url: detailApiAddress,
            data: payload,
        }).then(
            (response) => {
                console.log(response);
                updateSidebar();
            },
            (error) => {
                console.log(error);
            }
        );
    }

    function removeVrfConnection(event) {
        event.preventDefault();
        axios({
            method: "delete",
            url: detailApiAddress,
        }).then(
            (response) => {
                console.log(response);
                updateSidebar();
                history.push("/vrf/create");
            },
            (error) => {
                console.log(error);
            }
        );
    }

    const activeCheckboxHandler = () => {
        updateActive(!active);
    };

    const hardwareSupportCheckboxHandler = () => {
        updateHardwareSupport(!hardwareSupport);

        if (hardwareSupport === true) {
            updateArrayForCryptoPh1(softwareEncryption);
            updateArrayForCryptoPh2(softwareEncryption);
        } else {
            updateArrayForCryptoPh1(hardwarePh1Encryption);
            updateArrayForCryptoPh2(hardwarePh2Encryption);
        }
    };

    function forceNumberMinMax(event) {
        console.log("start update");

        let value = parseInt(event.target.value, 10);
        const min = parseInt(event.target.min, 10);
        const max = parseInt(event.target.max, 10);

        if (event.target.max && value > max) {
            value = max;
        }
        if (event.target.min && value < min) {
            value = min;
        }
        if (isNaN(value)) {
            return "";
        }
        return value;
    }

    return (
        <div>
            <div className="vrf-detail-container">
                /vrf/{detailVrf.client_name}
                <Button
                    className="btn red-btn delete-btn"
                    changeHandler={removeVrfConnection}
                    textValue="Delete VRF"
                />
                <br />
                <div className="vrf-detail-section-container">
                    <div className="vrf-section-header">VRF Details</div>
                    <form>
                        <div className="vrf-column-1">
                            <div className="vrf-column-1-item">
                                <label htmlFor="client_name">Name:</label>
                                <input
                                    type="text"
                                    name="client_name"
                                    id="client_name"
                                    value={vrfName}
                                    onChange={(event) =>
                                        updateVrfName(event.target.value)
                                    }
                                />{" "}
                                <br />
                                <label htmlFor="lan_ip">LAN IP/MASK:</label>
                                <input
                                    type="text"
                                    name="lan_ip"
                                    id="lan_ip"
                                    value={lanIpMask}
                                    onChange={(event) =>
                                        updateLanIpMask(event.target.value)
                                    }
                                />{" "}
                                <br />
                                <label htmlFor="physical_interface">
                                    Physical interface:
                                </label>
                                <input
                                    type="text"
                                    placeholder="eth0"
                                    name="physical_interface"
                                    id="physical_interface"
                                    value={physicalInterface}
                                    onChange={(event) =>
                                        updatePhysicalInterface(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="vrf-column-checkbox-item">
                                <input
                                    type="checkbox"
                                    name="active"
                                    id="active"
                                    checked={active}
                                    onChange={activeCheckboxHandler}
                                />
                                <label htmlFor="active">Active</label>
                                <input
                                    type="checkbox"
                                    name="hardware_support"
                                    id="hardware_support"
                                    checked={hardwareSupport}
                                    onChange={hardwareSupportCheckboxHandler}
                                />
                                <label
                                    id="checkbox-label"
                                    htmlFor="hardware_support"
                                >
                                    Hardware support
                                </label>
                            </div>
                            <Button
                                className="btn save-changes-to-vrf-button"
                                changeHandler={updateVrfConnection}
                                textValue="Save changes"
                            />
                        </div>
                        <div className="vrf-column-2">
                            <div className="vrf-column-item-number">
                                <label htmlFor="local_as">BGP local AS</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={maxValueForLocal_as}
                                    name="local_as"
                                    id="local_as"
                                    step="1"
                                    value={bgpValue}
                                    onChange={(event) =>
                                        updateBgpValue(forceNumberMinMax(event))
                                    }
                                />
                            </div>
                            <div className="vrf-column-item-number">
                                <label htmlFor="vlan">VLAN</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="4094"
                                    name="vlan"
                                    id="vlan"
                                    step="1"
                                    value={vlanValue}
                                    onChange={(event) =>
                                        updateVlanValue(
                                            forceNumberMinMax(event)
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className="vrf-column-3">
                            <div className="vrf-crypto-container">
                                <label htmlFor="crypto_ph1">
                                    Crypto phase 1
                                </label>
                                <select
                                    id="crypto_ph1_1"
                                    name="crypto_ph1_1"
                                    onChange={(event) =>
                                        updateCryptoPh1_1(event.target.value)
                                    }
                                    value={cryptoPh1_1}
                                >
                                    {arrayForCryptoPh1 &&
                                        arrayForCryptoPh1.encryption &&
                                        arrayForCryptoPh1.encryption.map(
                                            (element) => {
                                                return (
                                                    <option
                                                        defaultValue={
                                                            cryptoPh1_1
                                                        }
                                                        value={element}
                                                        key={uuidv4()}
                                                    >
                                                        {element}
                                                    </option>
                                                );
                                            }
                                        )}
                                </select>
                                <select
                                    id="crypto_ph1_2"
                                    name="crypto_ph1_2"
                                    onChange={(event) =>
                                        updateCryptoPh1_2(event.target.value)
                                    }
                                    value={cryptoPh1_2}
                                >
                                    {arrayForCryptoPh1 &&
                                        arrayForCryptoPh1.integrity &&
                                        arrayForCryptoPh1.integrity.map(
                                            (element) => {
                                                return (
                                                    <option
                                                        defaultValue={
                                                            cryptoPh1_2
                                                        }
                                                        value={element}
                                                        key={uuidv4()}
                                                    >
                                                        {element}
                                                    </option>
                                                );
                                            }
                                        )}
                                </select>
                                <select
                                    id="crypto_ph1_3"
                                    name="crypto_ph1_3"
                                    onChange={(event) =>
                                        updateCryptoPh1_3(event.target.value)
                                    }
                                    value={cryptoPh1_3}
                                >
                                    {arrayForCryptoPh1 &&
                                        arrayForCryptoPh1.key_exchange &&
                                        arrayForCryptoPh1.key_exchange.map(
                                            (element) => {
                                                return (
                                                    <option
                                                        defaultValue={
                                                            cryptoPh1_3
                                                        }
                                                        value={element}
                                                        key={uuidv4()}
                                                    >
                                                        {element}
                                                    </option>
                                                );
                                            }
                                        )}
                                </select>
                            </div>
                            <div className="vrf-crypto-container">
                                <label htmlFor="crypto_ph2">
                                    Crypto phase 2
                                </label>
                                <select
                                    id="crypto_ph2_1"
                                    name="crypto_ph2_1"
                                    onChange={(event) =>
                                        updateCryptoPh2_1(event.target.value)
                                    }
                                    value={cryptoPh2_1}
                                >
                                    {arrayForCryptoPh2 &&
                                        arrayForCryptoPh2.encryption &&
                                        arrayForCryptoPh2.encryption.map(
                                            (element) => {
                                                return (
                                                    <option
                                                        defaultValue={
                                                            cryptoPh2_1
                                                        }
                                                        value={element}
                                                        key={uuidv4()}
                                                    >
                                                        {element}
                                                    </option>
                                                );
                                            }
                                        )}
                                </select>
                                <select
                                    id="crypto_ph2_2"
                                    name="crypto_ph2_2"
                                    onChange={(event) =>
                                        updateCryptoPh2_2(event.target.value)
                                    }
                                    value={cryptoPh2_2}
                                >
                                    {arrayForCryptoPh2 &&
                                        arrayForCryptoPh2.integrity &&
                                        arrayForCryptoPh2.integrity.map(
                                             (element) => {
                                                return (
                                                    <option
                                                        defaultValue={
                                                            cryptoPh2_2
                                                        }
                                                        value={element}
                                                        key={uuidv4()}
                                                    >
                                                        {element}
                                                    </option>
                                                );
                                            }
                                        )}
                                </select>
                                <select
                                    id="crypto_ph2_3"
                                    name="crypto_ph2_3"
                                    onChange={(event) =>
                                        updateCryptoPh2_3(event.target.value)
                                    }
                                    value={cryptoPh2_3}
                                >
                                    {arrayForCryptoPh2 &&
                                        arrayForCryptoPh2.key_exchange &&
                                        arrayForCryptoPh2.key_exchange.map(
                                            (element) => {
                                                return (
                                                    <option
                                                        defaultValue={
                                                            cryptoPh2_3
                                                        }
                                                        value={element}
                                                        key={uuidv4()}
                                                    >
                                                        {element}
                                                    </option>
                                                );
                                            }
                                        )}
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="vrf-detail-section-container">
                    <div className="vrf-section-header">Endpoints</div>
                    <table className="endpoints-table">
                        <thead>
                            {hardwareSupport
                                ? renderTableHeadersForHardwareSupport()
                                : renderTableHeadersForSoftwareSupport()}
                        </thead>
                        <tbody>
                            {detailVrf &&
                                detailVrf.endpoints &&
                                detailVrf.endpoints.map((endpoint) => {
                                    return (
                                        <EndpointTableRow
                                            endpoint={endpoint}
                                            key={uuidv4()}
                                            hardwareSupport={hardwareSupport}
                                        />
                                    );
                                })}
                            <NewEndpointRow
                                hardwareSupport={hardwareSupport}
                                forceNumberMinMax={forceNumberMinMax}
                            />
                        </tbody>
                    </table>
                </div>
                <Dump {...detailVrf} />
            </div>
        </div>
    );
}
