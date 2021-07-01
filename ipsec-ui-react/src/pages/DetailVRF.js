import React from 'react';
import './DetailVRF.scss';
import './NewVRF.scss';
import {v4 as uuidv4} from 'uuid';
import Dump from "../components/Dump";

export default function detailViewVrf(props) {
    const detailVRF = props.VRFdata;

    if(detailVRF == null){
        return(
            <div>
                error, no active VRFs
            </div>
        )
    }
    return(
        <div className="vrf-detail-container">
            /vrf/{detailVRF.client_name}<br />
            <div className="vrf-detail-section-container">
                <div className="vrf-details-bar">VRF Details</div>
                <form>
                    {/*inputs need to have onChange property responsible for updating its state, ie name change and so on*/}
                    <div className="vrf-column-1">
                        <div className="vrf-column-item">
                            <label htmlFor="client_name">Name:</label>
                            <input type="text" name="client_name" id="client_name" readOnly={detailVRF.client_name} value={detailVRF.client_name}/>
                        </div>
                        <div className="vrf-column-item">
                            <input type="checkbox" name="active" id="active"/>
                            <label htmlFor="Active">Active</label>
                        </div>
                    </div>
                    <div className="vrf-column-2">
                        <div className="vrf-column-item">
                            <label htmlFor="vlan">VLAN</label>
                            <input type="number" name="vlan" id="vlan" step="1" readOnly={detailVRF.vlan} value={detailVRF.vlan}/>
                        </div>
                        <div className="vrf-column-item">
                            <label htmlFor="local_as">BGP local AS</label>
                            <input type="number" name="local_as" id="local_as" step="1" readOnly={detailVRF.local_as} value={detailVRF.local_as}/>
                        </div>
                    </div>
                    <div className="vrf-column-3">
                        <div className="vrf-crypto-container">
                            <label htmlFor="crypto_ph1">Crypto phase 1</label>
                            <input type="text" id="crypto_ph1_1" name="crypto_ph1" readOnly={detailVRF.crypto_ph1[0]} value={detailVRF.crypto_ph1[0]} />
                            <input type="text" id="crypto_ph1_2" name="crypto_ph1" readOnly={detailVRF.crypto_ph1[1]} value={detailVRF.crypto_ph1[1]} />
                            <input type="text" id="crypto_ph1_3" name="crypto_ph1" readOnly={detailVRF.crypto_ph1[2]} value={detailVRF.crypto_ph1[2]} />
                        </div>
                        <div className="vrf-crypto-container">
                            <label htmlFor="crypto_ph2">Crypto phase 2</label>
                            <input type="text" id="crypto_ph2_1" name="crypto_ph2" readOnly={detailVRF.crypto_ph2[0]} value={detailVRF.crypto_ph2[0]} />
                            <input type="text" id="crypto_ph2_2" name="crypto_ph2" readOnly={detailVRF.crypto_ph2[1]} value={detailVRF.crypto_ph2[1]} />
                            <input type="text" id="crypto_ph2_3" name="crypto_ph2" readOnly={detailVRF.crypto_ph2[2]} value={detailVRF.crypto_ph2[2]} />
                        </div>
                    </div>
                </form>
                {/*<table>*/}
                {/*    <thead>*/}
                {/*        <tr>*/}
                {/*            <th>*/}
                {/*                VRF Details*/}
                {/*            </th>*/}
                {/*        </tr>*/}
                {/*    </thead>*/}
                {/*    <tbody>*/}
                {/*        <tr className="vrf-main-settings-table">*/}
                {/*            <td>Name:</td>*/}
                {/*            <td className="break">{detailVRF.client_name}</td>*/}
                {/*            <td>VLAN:</td>*/}
                {/*            <td className="break">{detailVRF.vlan}</td>*/}
                {/*            <td>Crypto phase 1:</td>*/}
                {/*            <td>{detailVRF.crypto_ph1[0]}</td>*/}
                {/*            <td>{detailVRF.crypto_ph1[1]}</td>*/}
                {/*            <td>{detailVRF.crypto_ph1[2]}</td>*/}
                {/*        </tr>*/}
                {/*        <tr>*/}
                {/*            <td className="checkbox-holder">*/}
                {/*                <input type="checkbox" id="active_checkbox"/>*/}
                {/*            </td>*/}
                {/*            <td className="break"><p>Active</p></td>*/}
                {/*            <td>BGP local as:</td>*/}
                {/*            <td className="break">{detailVRF.local_as}</td>*/}
                {/*            <td >Crypto phase 2:</td>*/}
                {/*            <td>{detailVRF.crypto_ph2[0]}</td>*/}
                {/*            <td>{detailVRF.crypto_ph2[1]}</td>*/}
                {/*            <td>{detailVRF.crypto_ph2[2]}</td>*/}
                {/*        </tr>*/}
                {/*    </tbody>*/}
                {/*</table>*/}
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


            </div>
            <Dump value={detailVRF} />
        </div>
    )
}