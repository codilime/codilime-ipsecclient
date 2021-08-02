import React, { useState, useEffect } from "react";

import { useHistory, useParams } from "react-router";

import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import "./DetailVRF.scss";
import "../NewVRF/NewVRF.scss";

import EndpointTableRow from "../../components/EndpointTableRow/EndpointTableRow";
import NewEndpointRow from "../../components/NewEndpointRow/NewEndpointRow";
import CryptoHandler from "../../components/CryptoHandler/CryptoHandler";
import EndpointTableHeader from "../../components/EndpointTableHeader/EndpointTableHeader";
import Button from "../../components/Button/Button";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";

import Dump from "../../utils/Dump";
import { isEmptyObject } from "../../utils/util";
import Loader from "../../components/Loader/Loader";
import { forceNumberMinMax } from "../../utils/formatters";

export default function DetailViewVrf(props) {
    const { id } = useParams();
    const history = useHistory();

    const detailApiAddress = "/api/vrfs/" + id;
    const {
        softwareEncryption,
        hardwarePh1Encryption,
        hardwarePh2Encryption,
        updateSidebar,
        maxValueForLocal_as,
        maxValueForVlan
    } = props;

    const [detailVrf, updateDetailVrf] = useState();
    const [loading, updateLoading] = useState(true);

    const [vrfName, updateVrfName] = useState(vrfName);
    const [lanIpMask, updateLanIpMask] = useState(lanIpMask);
    const [physicalInterface, updatePhysicalInterface] =
        useState(physicalInterface);
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

    async function fetchVRFDetails() {
        axios({
            method: "get",
            url: detailApiAddress,
        }).then(
            (response) => {
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
                }
                updateLoading(false);
            },
            (error) => {
                console.log(error);
            }
        );
    }

    useEffect(() => {
        fetchVRFDetails();
    }, [id]);

    if (loading === true) {
        return <Loader />;
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
                history.push("create");
            },
            (error) => {
                console.log(error);
            }
        );
    }

    function activeCheckboxHandler() {
        updateActive(!active);
    }

    function hardwareSupportCheckboxHandler() {
        updateHardwareSupport(!hardwareSupport);

        if (hardwareSupport === true) {
            updateArrayForCryptoPh1(softwareEncryption);
            updateArrayForCryptoPh2(softwareEncryption);
        } else {
            updateArrayForCryptoPh1(hardwarePh1Encryption);
            updateArrayForCryptoPh2(hardwarePh2Encryption);
        }
    }

    return (
        <div>
            <div className="vrf-detail-container">
                <Breadcrumb vrfAddress={detailVrf.client_name} />
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
                                    max={maxValueForVlan}
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
                            <CryptoHandler
                                key={uuidv4()}
                                cryptoStage={"Crypto phase 1"}
                                softwareEncryption={softwareEncryption}
                                hardwarePh1Encryption={hardwarePh1Encryption}
                                hardwarePh2Encryption={hardwarePh2Encryption}
                                hardwareSupport={hardwareSupport}
                                arrayForCrypto={arrayForCryptoPh1}
                                valuePh1={cryptoPh1_1}
                                valuePh2={cryptoPh1_2}
                                valuePh3={cryptoPh1_3}
                                updatePh1={updateCryptoPh1_1}
                                updatePh2={updateCryptoPh1_2}
                                updatePh3={updateCryptoPh1_3}
                            />
                            <CryptoHandler
                                key={uuidv4()}
                                cryptoStage={"Crypto phase 2"}
                                softwareEncryption={softwareEncryption}
                                hardwarePh1Encryption={hardwarePh1Encryption}
                                hardwarePh2Encryption={hardwarePh2Encryption}
                                hardwareSupport={hardwareSupport}
                                arrayForCrypto={arrayForCryptoPh2}
                                valuePh1={cryptoPh2_1}
                                valuePh2={cryptoPh2_2}
                                valuePh3={cryptoPh2_3}
                                updatePh1={updateCryptoPh2_1}
                                updatePh2={updateCryptoPh2_2}
                                updatePh3={updateCryptoPh2_3}
                            />
                        </div>
                    </form>
                </div>
                <div className="vrf-detail-section-container">
                    <div className="vrf-section-header">Endpoints</div>
                    <table className="endpoints-table">
                        <thead>
                            <EndpointTableHeader
                                hardwareSupport={hardwareSupport}
                            />
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
                                payload={payload}
                            />
                        </tbody>
                    </table>
                </div>
                <Dump {...detailVrf} />
            </div>
        </div>
    );
}
