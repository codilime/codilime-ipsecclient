import React, {useState} from 'react';
import './NewVRF.scss'
import Dump from "../components/Dump";
import {v4 as uuidv4} from "uuid";
import axios from "axios";

export default function NewVRF({routeProps, cryptoPhaseEncryption, updateSidebar}) {
    const [vrfName, updateVrfName] = useState("");
    const [active, updateActive] = useState(false);
    const [vlanValue, updateVlanValue] = useState("1");
    const [bgpValue, updateBgpValue] = useState("1");
    const [cryptoPh1_1, updateCryptoPh1_1] = useState("");
    const [cryptoPh1_2, updateCryptoPh1_2] = useState("");
    const [cryptoPh1_3, updateCryptoPh1_3] = useState("");
    const [cryptoPh2_1, updateCryptoPh2_1] = useState("");
    const [cryptoPh2_2, updateCryptoPh2_2] = useState("");
    const [cryptoPh2_3, updateCryptoPh2_3] = useState("");

    const payload = {
        client_name: vrfName,
        active: active,
        vlan: parseInt(vlanValue),
        crypto_ph1: [cryptoPh1_1, cryptoPh1_2, cryptoPh1_3],
        crypto_ph2: [cryptoPh2_1, cryptoPh2_2, cryptoPh2_3],
        physical_interface: "",
        hardware_support: false,
        local_as: parseInt(bgpValue),
        lan_ip: "",
        endpoints: null
    }

    function pushNewVrfConnection(event) {
        event.preventDefault();
        axios({
            method: "post",
            url: "api/vrfs",
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
                            <input type="text"
                                   placeholder="set VRF name"
                                   name="client_name"
                                   id="client_name"
                                   onChange={event => updateVrfName(event.target.value)}/>
                        </div>
                        <div className="vrf-column-item">
                            <input type="checkbox" name="active" id="active" checked={active} onChange={activeCheckboxHandler}/>
                            <label htmlFor="active">Active</label>
                        </div>
                        <button className="btn" id="submit-vrf-button" onClick={pushNewVrfConnection}>Save changes</button>
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
                                            <option value={element} key={uuidv4()}>{element}</option>
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
                                            <option value={element} key={uuidv4()}>{element}</option>
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
                                            <option value={element} key={uuidv4()}>{element}</option>
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
                                            <option value={element} key={uuidv4()}>{element}</option>
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
                                            <option value={element} key={uuidv4()}>{element}</option>
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
        </div>
    );
}