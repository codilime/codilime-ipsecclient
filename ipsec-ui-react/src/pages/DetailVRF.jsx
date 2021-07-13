import React, {useState, useEffect} from 'react';
import './DetailVRF.scss';
import './NewVRF.scss';
import {v4 as uuidv4} from 'uuid';
import Dump from "../components/Dump";
import axios from "axios";
import {useHistory, useParams} from "react-router";
import {isEmptyObject} from "../util";


export default function DetailViewVrf({cryptoPhaseEncryption, updateSidebar}) {
    const {id} = useParams();
    let history = useHistory();
    const detailApiAddress = "/api/vrfs/" + id;

    // states for app rendering
    const [detailVrf, updateDetailVrf] = useState();
    const [loading, updateLoading] = useState(true);

    //states for actual form data, first updated in fetchThisVrfDetails
    const [vrfName, updateVrfName] = useState(vrfName);
    const [lanIpMask, updateLanIpMask] = useState(lanIpMask)
    const [active, updateActive] = useState(active);
    const [vlanValue, updateVlanValue] = useState(vlanValue);
    const [bgpValue, updateBgpValue] = useState(bgpValue);
    const [cryptoPh1_1, updateCryptoPh1_1] = useState(cryptoPh1_1);
    const [cryptoPh1_2, updateCryptoPh1_2] = useState(cryptoPh1_2);
    const [cryptoPh1_3, updateCryptoPh1_3] = useState(cryptoPh1_3);
    const [cryptoPh2_1, updateCryptoPh2_1] = useState(cryptoPh2_1);
    const [cryptoPh2_2, updateCryptoPh2_2] = useState(cryptoPh2_2);
    const [cryptoPh2_3, updateCryptoPh2_3] = useState(cryptoPh2_3);

    async function fetchThisVrfDetails() {
        const response = await axios.get(detailApiAddress);

        let data = response.data;

        console.log("data", data);

        if (data && !isEmptyObject(data)) {
            updateDetailVrf(data);
            updateVrfName(data.client_name);
            updateLanIpMask(data.lan_ip);
            updateActive(data.active);
            updateVlanValue(data.vlan);
            updateBgpValue(data.local_as);
            updateCryptoPh1_1(data.crypto_ph1[0]);
            updateCryptoPh1_2(data.crypto_ph1[1]);
            updateCryptoPh1_3(data.crypto_ph1[2]);
            updateCryptoPh2_1(data.crypto_ph2[0]);
            updateCryptoPh2_2(data.crypto_ph2[1]);
            updateCryptoPh2_3(data.crypto_ph2[2]);
        }
    }

    useEffect(() => {
        fetchThisVrfDetails().then(() => updateLoading(false));
    }, [id]);

    if (loading === true) {
        return(
            <div>fetching data, please wait</div>
        )
    }

    const payload = {
        client_name: vrfName,
        lan_ip: lanIpMask,
        active: active,
        vlan: parseInt(vlanValue),
        crypto_ph1: [cryptoPh1_1, cryptoPh1_2, cryptoPh1_3],
        crypto_ph2: [cryptoPh2_1, cryptoPh2_2, cryptoPh2_3],
        physical_interface: "",
        hardware_support: false,
        local_as: parseInt(bgpValue),
        endpoints: null
    }

    // functions responsible for handling connections


    function updateVrfConnection(event) {
        event.preventDefault();
        axios({
            method: "put",
            url: detailApiAddress,
            data: payload
        })
        .then((response) => {
                console.log(response);
                updateSidebar();
            }, (error) => {
                console.log(error);
            }
        )
    }

    function removeVrfConnection(event) {
        event.preventDefault();
        axios({
            method: "delete",
            url: detailApiAddress,
        })
            .then((response) => {
                console.log(response);
                updateSidebar();
                history.push('/vrf/create');
            }, (error) => {
                console.log(error);
            }
        )
    }

    const activeCheckboxHandler = () => {
        updateActive(!active);
    }

    function forceNumberMinMax(event) {
        console.log("start update");

        let value = parseInt(event.target.value);
        const min = parseInt(event.target.min);
        const max = parseInt(event.target.max);

        if (event.target.max && value > max) {
            console.log("wartosc za wysoka, wyrownuje");
            value = max;
        }
        if (event.target.min && value < min) {
            console.log("wartosc za niska, wyrownuje");
            value = min;
        }
        if (isNaN(value)) {
            return "";
        }
        console.log("ustawiam poprawna wartosc na: ", value);
        return value;
    }

    return(
        <div>
            <div className="vrf-detail-container">
                /vrf/{detailVrf.client_name} <button className="btn red-btn delete-btn" onClick={removeVrfConnection}>Delete VRF</button> <br />
                <div className="vrf-detail-section-container">
                    <div className="vrf-details-bar">VRF Details</div>
                    <form>
                        {/*additionally active checkbox needs some kind of a handler to display proper value*/}
                        <div className="vrf-column-1">
                            <div className="vrf-column-1-item">
                                <label htmlFor="client_name">Name:</label>
                                <input type="text"
                                       name="client_name"
                                       id="client_name"
                                       value={vrfName}
                                       onChange={event => updateVrfName(event.target.value)}
                                /> <br />
                                <label htmlFor="lan_ip">LAN IP/MASK:</label>
                                <input type="text"
                                       name="lan_ip"
                                       id="lan_ip"
                                       value={lanIpMask}
                                       onChange={event => updateLanIpMask(event.target.value)}
                                />
                            </div>
                            <div className="vrf-column-item">
                                <input type="checkbox" name="active" id="active" checked={active} onChange={activeCheckboxHandler}/>
                                <label htmlFor="active">Active</label>
                            </div>
                            <button className="btn" id="save-changes-to-vrf-button" onClick={updateVrfConnection}>Save changes</button>
                        </div>
                        <div className="vrf-column-2">
                            <div className="vrf-column-item-number">
                                <label htmlFor="vlan">VLAN</label>
                                <input type="number"
                                       min="1"
                                       max="4094"
                                       name="vlan" id="vlan"
                                       step="1"
                                       value={vlanValue}
                                       onChange={event => updateVlanValue(forceNumberMinMax(event))}
                                />
                            </div>
                            <div className="vrf-column-item-number">
                                <label htmlFor="local_as">BGP local AS</label>
                                <input type="number"
                                       min="1"
                                       max={Math.pow(2, 32)}
                                       name="local_as" id="local_as"
                                       step="1"
                                       value={bgpValue}
                                       onChange={event => updateBgpValue(forceNumberMinMax(event))}
                                />
                            </div>
                        </div>
                        <div className="vrf-column-3">
                            <div className="vrf-crypto-container">
                                <label htmlFor="crypto_ph1">Crypto phase 1</label>
                                <select id="crypto_ph1_1"
                                        name="crypto_ph1_1"
                                        onChange={event => updateCryptoPh1_1(event.target.value)}
                                        value={cryptoPh1_1}>
                                        {cryptoPhaseEncryption && cryptoPhaseEncryption.encryption
                                        && cryptoPhaseEncryption.encryption.map(function(element) {
                                            return (
                                                <option defaultValue={cryptoPh1_1} value={element} key={uuidv4()}>{element}</option>
                                            )
                                        })}
                                </select>
                                <select id="crypto_ph1_2"
                                        name="crypto_ph1_2"
                                        onChange={event => updateCryptoPh1_2(event.target.value)}
                                        value={cryptoPh1_2}>
                                        {cryptoPhaseEncryption && cryptoPhaseEncryption.integrity
                                        && cryptoPhaseEncryption.integrity.map(function(element) {
                                            return (
                                                <option defaultValue={cryptoPh1_2} value={element} key={uuidv4()}>{element}</option>
                                            )
                                        })}
                                </select>
                                <select id="crypto_ph1_3"
                                        name="crypto_ph1_3"
                                        onChange={event => updateCryptoPh1_3(event.target.value)}
                                        value={cryptoPh1_3}>
                                        {cryptoPhaseEncryption && cryptoPhaseEncryption.key_exchange
                                        && cryptoPhaseEncryption.key_exchange.map(function(element) {
                                            return (
                                                <option defaultValue={cryptoPh1_3} value={element} key={uuidv4()}>{element}</option>
                                            )
                                        })}
                                </select>
                            </div>
                            <div className="vrf-crypto-container">
                                <label htmlFor="crypto_ph2">Crypto phase 2</label>
                                <select id="crypto_ph2_1"
                                        name="crypto_ph2_1"
                                        onChange={event => updateCryptoPh2_1(event.target.value)}
                                        value={cryptoPh2_1}>
                                        {cryptoPhaseEncryption && cryptoPhaseEncryption.encryption
                                        && cryptoPhaseEncryption.encryption.map(function(element) {
                                            return (
                                                <option defaultValue={cryptoPh2_1} value={element} key={uuidv4()}>{element}</option>
                                            )
                                        })}
                                </select>
                                <select id="crypto_ph2_2"
                                        name="crypto_ph2_2"
                                        onChange={event => updateCryptoPh2_2(event.target.value)}
                                        value={cryptoPh2_2}>
                                        {cryptoPhaseEncryption && cryptoPhaseEncryption.integrity
                                        && cryptoPhaseEncryption.integrity.map(function(element) {
                                            return (
                                                <option defaultValue={cryptoPh2_2} value={element} key={uuidv4()}>{element}</option>
                                            )
                                        })}
                                </select>
                                <select id="crypto_ph2_3"
                                        name="crypto_ph2_3"
                                        onChange={event => updateCryptoPh2_3(event.target.value)}
                                        value={cryptoPh2_3}>
                                        {cryptoPhaseEncryption && cryptoPhaseEncryption.key_exchange
                                        && cryptoPhaseEncryption.key_exchange.map(function(element) {
                                            return (
                                                <option defaultValue={cryptoPh2_3} value={element} key={uuidv4()}>{element}</option>
                                            )
                                        })}
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="vrf-detail-section-container">
                    <table id="endpoints-table">
                        <thead>
                        <tr>
                            <th colSpan="7">
                                Endpoints
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <th>Remote IP</th>
                            <th>Local IP</th>
                            <th>Peer IP</th>
                            <th>PSK</th>
                            <th>NAT</th>
                            <th>BGP</th>
                            <th>Action</th>
                        </tr>
                        {detailVrf && detailVrf.endpoints && detailVrf.endpoints.map(function(endpoint) {
                            return (
                                <tr key={uuidv4()}>
                                    <td>{endpoint.remote_ip_sec}</td>
                                    <td>{endpoint.local_ip}</td>
                                    <td>{endpoint.peer_ip}</td>
                                    <td>{endpoint.psk}</td>
                                    <td>{endpoint.nat}</td>
                                    <td>{endpoint.bgp}</td>
                                    <td>
                                        <button className="btn edit-btn">...</button>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
                <div className="vrf-detail-section-container">
                    visu
                </div>
                <Dump value={detailVrf} />

            </div>
        </div>
    )
}


