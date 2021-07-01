import React from 'react';
import './NewVRF.scss'
import Dump from "../components/Dump";
import {v4 as uuidv4} from "uuid";

export default function NewVRF({routeProps, cryptoPhaseEncryption}) {

    return (
        <div className="new-vrf-connection-wrapper">
            <div className="new-vrf-top-bar">
                {routeProps.location.pathname}
            </div>
            <div className="new-vrf-data-container">
                <div className="vrf-details-bar">VRF Details</div>
                <form>
                    <div className="vrf-column">
                        <div className="vrf-column-item">
                            <label htmlFor="client_name">Name:</label>
                            <input type="text" name="client_name" id="client_name"/>
                        </div>
                        <div className="vrf-column-item">
                            <input type="checkbox" name="active" id="active"/>
                            <label htmlFor="Active">Active</label>
                        </div>
                    </div>
                    <div className="vrf-column">
                        <div className="vrf-column-item">
                            <label htmlFor="vlan">VLAN</label>
                            <input type="number" name="vlan" id="vlan" step="1" value="0"/>
                        </div>
                        <div className="vrf-column-item">
                            <label htmlFor="local_as">BGP local AS</label>
                            <input type="number" name="local_as" id="local_as" step="1" value="0"/>
                        </div>
                    </div>
                    <div className="vrf-column">
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
