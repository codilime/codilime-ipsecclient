import React, {useState} from 'react';
import './NewVRF.scss'
import Dump from "../components/Dump";
import {v4 as uuidv4} from "uuid";
import axios from "axios";


export default function NewVRF({routeProps, cryptoPhaseEncryption}) {
    const [vrfName, updateVrfName] = useState("");
    const [vlanValue, updateVlanValue] = useState("-1");
    const [bgpValue, updateBgpValue] = useState("-1");
    const [cryptoPh1_1, updateCryptoPh1_1] = useState("");
    const [cryptoPh1_2, updateCryptoPh1_2] = useState("");
    const [cryptoPh1_3, updateCryptoPh1_3] = useState("");
    const [cryptoPh2_1, updateCryptoPh2_1] = useState("");
    const [cryptoPh2_2, updateCryptoPh2_2] = useState("");
    const [cryptoPh2_3, updateCryptoPh2_3] = useState("");

    const payload = {
        id: 8,
        client_name: vrfName,
        vlan: parseInt(vlanValue),
        crypto_ph1: [cryptoPh1_1, cryptoPh1_2, cryptoPh1_3],
        crypto_ph2: [cryptoPh2_1, cryptoPh2_2, cryptoPh2_3],
        physical_interface: "",
        active: false,
        hardware_support: false,
        local_as: parseInt(bgpValue),
        lan_ip: "",
        endpoints: null
    }

    console.log("this is payload", payload);

    function pushNewVrfConnection(event) {
        event.preventDefault();

        axios({
            method: "post",
            url: "api/vrfs",
            data: payload
        })
        .then((response) => {
            console.log(response);
        }, (error) => {
            console.log(error);
            }
        )
    }

    return (
        <div className="new-vrf-connection-wrapper">
            <div className="new-vrf-top-bar">
                {routeProps.location.pathname}
            </div>
            <div className="new-vrf-data-container">
                <div className="vrf-details-bar">VRF Details</div>
                <form>
                    <div className="vrf-column-1">
                        <div className="vrf-column-item">
                            <label htmlFor="client_name">Name:</label>
                            <input type="text" name="client_name" id="client_name" onChange={event => updateVrfName(event.target.value)}/>
                        </div>
                        <div className="vrf-column-item">
                            <input type="checkbox" name="active" id="active"/>
                            <label htmlFor="Active">Active</label>
                        </div>
                        <button className="btn" id="submit-vrf-button" onClick={pushNewVrfConnection}>Save changes</button>
                    </div>
                    <div className="vrf-column-2">
                        <div className="vrf-column-item-number">
                            <label htmlFor="vlan">VLAN</label>
                            <input type="number" name="vlan" id="vlan" step="1" value={vlanValue}
                                   onChange={event => updateVlanValue(event.target.value)}/>
                        </div>
                        <div className="vrf-column-item-number">
                            <label htmlFor="local_as">BGP local AS</label>
                            <input type="number" name="local_as" id="local_as" step="1" value={bgpValue}
                                   onChange={event => updateBgpValue(event.target.value)}/>
                        </div>
                    </div>
                    <div className="vrf-column-3">
                        <div className="vrf-crypto-container">
                            <label htmlFor="crypto_ph1">Crypto phase 1</label>
                            <select id="crypto_ph1_1" name="crypto_ph1_1" onChange={event => updateCryptoPh1_1(event.target.value)} value={cryptoPh1_1}>
                                {cryptoPhaseEncryption && cryptoPhaseEncryption.encryption
                                && cryptoPhaseEncryption.encryption.map(function(element) {
                                    return (
                                        <option value={element} key={uuidv4()}>{element}</option>
                                    )
                                })}
                            </select>
                            <select id="crypto_ph1_2" name="crypto_ph1_2" onChange={event => updateCryptoPh1_2(event.target.value)} value={cryptoPh1_2}>
                                {cryptoPhaseEncryption && cryptoPhaseEncryption.integrity
                                && cryptoPhaseEncryption.integrity.map(function(element) {
                                    return (
                                        <option value={element} key={uuidv4()}>{element}</option>
                                    )
                                })}
                            </select>
                            <select id="crypto_ph1_3" name="crypto_ph1_3" onChange={event => updateCryptoPh1_3(event.target.value)} value={cryptoPh1_3}>
                                {cryptoPhaseEncryption && cryptoPhaseEncryption.key_exchange
                                && cryptoPhaseEncryption.key_exchange.map(function(element) {
                                    return (
                                        <option value={element} key={uuidv4()}>{element}</option>
                                    )
                                })}
                            </select>
                        </div>
                        <div className="vrf-crypto-container">
                            <label htmlFor="crypto_ph2">Crypto phase 2</label>
                            <select id="crypto_ph2_1" name="crypto_ph2_1" onChange={event => updateCryptoPh2_1(event.target.value)} value={cryptoPh2_1}>
                                {cryptoPhaseEncryption && cryptoPhaseEncryption.encryption
                                && cryptoPhaseEncryption.encryption.map(function(element) {
                                    return (
                                        <option value={element} key={uuidv4()}>{element}</option>
                                    )
                                })}
                            </select>
                            <select id="crypto_ph2_2" name="crypto_ph2_2" onChange={event => updateCryptoPh2_2(event.target.value)} value={cryptoPh2_2}>
                                {cryptoPhaseEncryption && cryptoPhaseEncryption.integrity
                                && cryptoPhaseEncryption.integrity.map(function(element) {
                                    return (
                                        <option value={element} key={uuidv4()}>{element}</option>
                                    )
                                })}
                            </select>
                            <select id="crypto_ph2_3" name="crypto_ph2_3" onChange={event => updateCryptoPh2_3(event.target.value)} value={cryptoPh2_3}>
                                {cryptoPhaseEncryption && cryptoPhaseEncryption.key_exchange
                                && cryptoPhaseEncryption.key_exchange.map(function(element) {
                                    return (
                                        <option value={element} key={uuidv4()}>{element}</option>
                                    )
                                })}
                            </select>
                        </div>
                    </div>
                </form>
            </div>
            <div className="new-vrf-data-container">
                endpoints table
            </div>
            <div className="new-vrf-data-container">
                visualization
            </div>
            <Dump value={cryptoPhaseEncryption.encryption} />
        </div>
    );
}