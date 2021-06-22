import React from 'react';
import './NewVRF.scss'

export default function NewVRF({routeProps}) {
    // the following are testing functions for currently unscripted buttons in vrf and endpoint sections
    function logClick1 () {
        console.log("save button for vrf goes brrrrrr");
    }
    function logClick2 () {
        console.log("this is endpoints button going brrrrrr");
    }
    function logClick3 () {
        console.log("this is delete button going brrrrrr");
    }

    return (
        <div className="new-vrf-connection-wrapper">
            <div className="new-vrf-top-bar">
                {routeProps.location.pathname}
                <button className="btn red-button" onClick={logClick3}>Delete</button>
            </div>
            <div className="new-vrf-data-container">
                new connection table
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
