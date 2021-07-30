import React, { useEffect, useState } from "react";

import { useHistory } from "react-router";

import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import "./NewVRF.scss";

import NewEndpointRow from "../components/NewEndpointRow";
import EndpointTableHeader from "../components/EndpointTableHeader";
import Breadcrumb from "../components/Breadcrumb";
import Dump from "../components/Dump";
import { forceNumberMinMax } from "../utils/formatters";

export default function NewVRF(props) {
    const history = useHistory();

    const {
        routeProps,
        softwareEncryption,
        hardwarePh1Encryption,
        hardwarePh2Encryption,
        updateSidebar,
        maxValueForLocal_as,
    } = props;

    useEffect(() => {
        updateArrayForCryptoPh1(softwareEncryption);
        updateArrayForCryptoPh2(softwareEncryption);
    }, [softwareEncryption]);

    const [vrfName, updateVrfName] = useState("");
    const [lanIpMask, updateLanIpMask] = useState("");
    const [active, updateActive] = useState(false);
    const [hardwareSupport, updateHardwareSupport] = useState(false);
    const [physicalInterface, updatePhysicalInterface] = useState("");
    const [vlanValue, updateVlanValue] = useState("1");
    const [bgpValue, updateBgpValue] = useState("1");
    const [cryptoPh1_1, updateCryptoPh1_1] = useState("");
    const [cryptoPh1_2, updateCryptoPh1_2] = useState("");
    const [cryptoPh1_3, updateCryptoPh1_3] = useState("");
    const [cryptoPh2_1, updateCryptoPh2_1] = useState("");
    const [cryptoPh2_2, updateCryptoPh2_2] = useState("");
    const [cryptoPh2_3, updateCryptoPh2_3] = useState("");

    const [arrayForCryptoPh1, updateArrayForCryptoPh1] =
        useState(softwareEncryption);
    const [arrayForCryptoPh2, updateArrayForCryptoPh2] =
        useState(softwareEncryption);

    const payload = {
        client_name: vrfName,
        lan_ip: lanIpMask,
        physical_interface: physicalInterface,
        hardware_support: hardwareSupport,
        active: active,
        vlan: parseInt(vlanValue, 10),
        crypto_ph1: [cryptoPh1_1, cryptoPh1_2, cryptoPh1_3],
        crypto_ph2: [cryptoPh2_1, cryptoPh2_2, cryptoPh2_3],
        local_as: parseInt(bgpValue, 10),
        endpoints: null,
    };

    function pushNewVrfConnection(event) {
        event.preventDefault();
        axios({
            method: "post",
            url: "api/vrfs",
            data: payload,
        }).then(
            (response) => {
                console.log(response.data.id);
                updateSidebar();
                history.push("/vrf/" + response.data.id);
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

    function addEndpointsToPayload() {
        console.log("I'm adding this endpoint to the payload");
    }

    return (
        <div className="new-vrf-connection-wrapper">
            <div className="new-vrf-top-bar">
                <Breadcrumb
                    vrfAddress={routeProps.location.pathname.slice(5)}
                />
            </div>
            <div className="new-vrf-data-container">
                <div className="vrf-section-header">VRF Details</div>
                <form>
                    <div className="vrf-column-1">
                        <div className="vrf-column-1-item">
                            <label htmlFor="client_name">Name:</label>
                            <input
                                type="text"
                                placeholder="set VRF name"
                                name="client_name"
                                id="client_name"
                                onChange={(event) =>
                                    updateVrfName(event.target.value)
                                }
                            />{" "}
                            <br />
                            <label htmlFor="lan_ip">LAN IP/Mask:</label>
                            <input
                                type="text"
                                placeholder="set LAN mask"
                                name="lan_ip"
                                id="lan_ip"
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
                                onChange={(event) =>
                                    updatePhysicalInterface(event.target.value)
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
                            <label id="checkbox-label" htmlFor="active">
                                Active
                            </label>
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
                        <button
                            className="btn"
                            id="submit-vrf-button"
                            onClick={pushNewVrfConnection}
                        >
                            Save changes
                        </button>
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
                                    updateVlanValue(forceNumberMinMax(event))
                                }
                            />
                        </div>
                    </div>
                    <div className="vrf-column-3">
                        <div className="vrf-crypto-container">
                            <label htmlFor="crypto_ph1">Crypto phase 1</label>
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
                            <label htmlFor="crypto_ph2">Crypto phase 2</label>
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
                        <EndpointTableHeader hardwareSupport={hardwareSupport} />
                    </thead>
                    <tbody>
                        <NewEndpointRow
                            hardwareSupport={hardwareSupport}
                            forceNumberMinMax={forceNumberMinMax}
                        />
                    </tbody>
                </table>
                <button
                    className="btn endpoint-btn"
                    onClick={addEndpointsToPayload}
                >
                    Add new endpoint
                </button>
            </div>
            <Dump value={routeProps.location} />
        </div>
    );
}
