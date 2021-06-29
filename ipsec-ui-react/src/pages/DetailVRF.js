import React from 'react';
import './DetailVRF.scss';
import {v4 as uuidv4} from 'uuid';
import Dump from "../components/Dump";

export default function detailViewVrf(props) {
    const detailVRF = props.VRFdata;

    if(detailVRF == null){
        return(
            <div>
                error, no data
            </div>
        )
    }
    return(
        <div className="vrf-detail-container">
            /vrf/{detailVRF.client_name}<br />
            <div className="vrf-detail-section-container">
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
                            <td>Name:</td>
                            <td className="break">{detailVRF.client_name}</td>
                            <td>VLAN:</td>
                            <td className="break">{detailVRF.vlan}</td>
                            <td>Crypto phase 1:</td>
                            <td>{detailVRF.crypto_ph1[0]}</td>
                            <td>{detailVRF.crypto_ph1[1]}</td>
                            <td>{detailVRF.crypto_ph1[2]}</td>
                        </tr>
                        <tr>
                            <td className="checkbox-holder">
                                <input type="checkbox" id="active_checkbox"/>
                            </td>
                            <td className="break"><p>Active</p></td>
                            <td>BGP local as:</td>
                            <td className="break">{detailVRF.local_as}</td>
                            <td >Crypto phase 2:</td>
                            <td>{detailVRF.crypto_ph2[0]}</td>
                            <td>{detailVRF.crypto_ph2[1]}</td>
                            <td>{detailVRF.crypto_ph2[2]}</td>
                        </tr>
                    </tbody>
                </table>
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
                            {detailVRF && detailVRF.endpoints && detailVRF.endpoints.map(function(endpoint) {
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
            <Dump value={detailVRF.endpoints} />
        </div>
    )
}