import React, {useState} from 'react';
import './NewVRF.scss'
import Dump from "../components/Dump";
import {v4 as uuidv4} from "uuid";

export default function NewVRF({routeProps, cryptoPhaseEncryption}) {
    const [vrfName, updateVrfName] = useState("");
    const [vlanValue, updateVlanValue] = useState("-1");
    const [bgpValue, updateBgpValue] = useState("-1");
    const [cryptoPh1, updateCryptoPh1] = useState([]);
    const [cryptoPh2, updateCryptoPh2] = useState([])

    const saveButton = document.getElementById("submit-vrf-button");
    if(vrfName) {
        saveButton.removeAttribute("disabled");
    } else {
        saveButton.setAttribute("disabled", "disabled");
    }

    function saveCryptoData(event) {
        // event.preventDefault();
        console.log("updating");
        // updateCryptoPh1();
        // updateCryptoPh2();
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
                        <button className="btn" id="submit-vrf-button" onClick={saveCryptoData} disabled>Save changes</button>
                    </div>
                    <div className="vrf-column-2">
                        <div className="vrf-column-item-number">
                            <label htmlFor="vlan">VLAN</label>
                            <input type="number" name="vlan" id="vlan" step="1" defaultValue={vlanValue}
                                   onChange={event => updateVlanValue(event.target.value)}/>
                        </div>
                        <div className="vrf-column-item-number">
                            <label htmlFor="local_as">BGP local AS</label>
                            <input type="number" name="local_as" id="local_as" step="1" defaultValue={bgpValue}
                                   onChange={event => updateBgpValue(event.target.value)}/>
                        </div>
                    </div>
                    <div className="vrf-column-3">
                        <div className="vrf-crypto-container">
                            <label htmlFor="crypto_ph1">Crypto phase 1</label>
                            <select id="crypto_ph1" name="crypto_ph1">
                                {cryptoPhaseEncryption && cryptoPhaseEncryption.encryption
                                && cryptoPhaseEncryption.encryption.map(function(element) {
                                    return (
                                        <option value={element} key={uuidv4()}>{element}</option>
                                    )
                                })}
                            </select>
                            <select id="crypto_ph1" name="crypto_ph1">
                                {cryptoPhaseEncryption && cryptoPhaseEncryption.integrity
                                && cryptoPhaseEncryption.integrity.map(function(element) {
                                    return (
                                        <option value={element} key={uuidv4()}>{element}</option>
                                    )
                                })}
                            </select>
                            <select id="crypto_ph1" name="crypto_ph1">
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
                            <select id="crypto_ph2" name="crypto_ph2">
                                {cryptoPhaseEncryption && cryptoPhaseEncryption.encryption
                                && cryptoPhaseEncryption.encryption.map(function(element) {
                                    return (
                                        <option value={element} key={uuidv4()}>{element}</option>
                                    )
                                })}
                            </select>
                            <select id="crypto_ph1" name="crypto_ph1">
                                {cryptoPhaseEncryption && cryptoPhaseEncryption.integrity
                                && cryptoPhaseEncryption.integrity.map(function(element) {
                                    return (
                                        <option value={element} key={uuidv4()}>{element}</option>
                                    )
                                })}
                            </select>
                            <select id="crypto_ph1" name="crypto_ph1">
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