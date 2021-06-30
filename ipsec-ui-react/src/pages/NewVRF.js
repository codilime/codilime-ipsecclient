import React, {useState} from 'react';
import './NewVRF.scss'
import Dump from "../components/Dump";

export default function NewVRF({routeProps}, props) {
    const [VRFName, updateVRFName] = useState("");

    const crypto = props.cryptoPhaseEncryption;


    return (
        <div className="new-vrf-connection-wrapper">
            <div className="new-vrf-top-bar">
                {routeProps.location.pathname}
            </div>
            <div className="new-vrf-data-container">
                <table>
                    <thead>
                    <tr>
                        <th>
                            VRF Details
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr className="vrf-main-settings-table">
                        <td>
                            <label for="client_name">Name:</label>
                        </td>
                        <td className="break">
                            <input type="text" id="client_name"/>
                        </td>
                        <td>VLAN:</td>
                        <td className="break">select</td>
                        <td>Crypto phase 1:</td>
                        <td>encryption</td>
                        <td>integrity</td>
                        <td>key_exchange</td>
                    </tr>
                    <tr>
                        <td className="checkbox-holder">
                            <input type="checkbox" id="active_checkbox"/>
                        </td>
                        <td className="break"><p>Active</p></td>
                        <td>BGP local as:</td>
                        <td className="break">select</td>
                        <td >Crypto phase 2:</td>
                        <td>encryption</td>
                        <td>integrity</td>
                        <td>key_exchange</td>
                    </tr>
                    </tbody>
                </table>
                <button className="btn">Save</button>
            </div>
            <div className="new-vrf-data-container">
                endpoints table
            </div>
            <div className="new-vrf-data-container">
                visualization
            </div>
            <Dump value={crypto} />
        </div>
    );
}
