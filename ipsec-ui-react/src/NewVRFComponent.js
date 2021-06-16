import React from 'react';
import './NewVRFComponent.scss'

export default function ({routeProps}) {
    console.log({routeProps});

    function logClick () {
        console.log("save button for vrf goes brrrrrr");
    }

    return (
        <div className="vrf-connection-wrapper">
            {routeProps.location.pathname}
            <div className="new-vrf-details">
                <table id="new-vrf-details-table">
                    <tr>
                        <th colSpan="3">
                            VRF details
                        </th>
                    </tr>
                    <tr>
                        <td>
                            Name:
                        </td>
                        <td>
                            VLAN:
                        </td>
                        <td>
                            Crypto phase 1:
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Active [x]
                        </td>
                        <td>
                            BGP local as:
                        </td>
                        <td>
                            Crypto phase 2:
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="3" className="save-button-container">
                            <button className="btn save-vrf-settings-btn" onClick={logClick}>
                                Save changes
                            </button>
                        </td>
                    </tr>
                </table>

            </div>
            <div className="endpoints-details">
                placeholder for table with endpoints
            </div>
            <div className="visualization">
                placeholder for connections visualization, generated from set up connections <br />
                bbb <br />
                bbb <br />
                bbb <br />
            </div>
        </div>
    );
}
