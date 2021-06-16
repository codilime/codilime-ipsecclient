import React from 'react';
import './NewVRFComponent.scss'

export default function ({routeProps}) {
    // the following are testing functions for currently unscripted buttons in vrf and endpoint sections
    function logClick1 () {
        console.log("save button for vrf goes brrrrrr");
    }
    function logClick2 () {
        console.log("this is endpoints button going brrrrrr");
    }

    return (
        <div className="vrf-connection-wrapper">
            {routeProps.location.pathname}
            <div className="new-vrf-details">
                <table id="new-vrf-details-table">
                    <tr>
                        <th colSpan="3">VRF details</th>
                    </tr>
                    <tr>
                        <td>Name:</td>
                        <td>VLAN:</td>
                        <td>Crypto phase 1:</td>
                    </tr>
                    <tr>
                        <td>Active [x]</td>
                        <td>BGP local as:</td>
                        <td>Crypto phase 2:</td>
                    </tr>
                    <tr>
                        <td colSpan="3" className="save-button-container">
                            <button className="btn blue-button" onClick={logClick1}>
                                Save changes
                            </button>
                        </td>
                    </tr>
                </table>

            </div>
            <div className="endpoints-details">
                <table id="endpoints-details-table">
                    <tr>
                        <th colSpan="7">Endpoints</th>
                    </tr>
                    <tr>
                        <td>Remote IP</td>
                        <td>Local IP</td>
                        <td>Peer IP</td>
                        <td>PSK</td>
                        <td>NAT</td>
                        <td>BGP</td>
                        <td>Action</td>
                    </tr>
                    <tr>
                        <td>192.158.1.38</td>
                        <td>192.158.1.38</td>
                        <td>192.158.1.38</td>
                        <td>**************</td>
                        <td>Active</td>
                        <td>Active</td>
                        <td>...</td>
                    </tr>
                    <tr>
                        <td>192.158.1.38</td>
                        <td>192.158.1.38</td>
                        <td>192.158.1.38</td>
                        <td>**************</td>
                        <td>Active</td>
                        <td>Active</td>
                        <td>...</td>
                    </tr>
                    <tr>
                        <td>192.158.1.38</td>
                        <td>192.158.1.38</td>
                        <td>192.158.1.38</td>
                        <td>**************</td>
                        <td>Active</td>
                        <td>Active</td>
                        <td>...</td>
                    </tr>
                    <tr>
                        <td>192.158.1.38</td>
                        <td>192.158.1.38</td>
                        <td>192.158.1.38</td>
                        <td>**************</td>
                        <td>Active</td>
                        <td>Active</td>
                        <td>...</td>
                    </tr>
                    <tr>
                        <td>192.158.1.38</td>
                        <td>192.158.1.38</td>
                        <td>192.158.1.38</td>
                        <td>**************</td>
                        <td>Active</td>
                        <td>Active</td>
                        <td>...</td>
                    </tr>
                    <tr>
                        <td colSpan="7" className="save-button-container">
                            <button className="btn blue-button" onClick={logClick2}>
                                Add a new endpoint
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div className="visualization">
                placeholder for connections visualization, generated from set up connections <br />
                bbb <br />
                bbb <br />
                bbb <br />
                bbb <br />
            </div>
        </div>
    );
}
