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
        <div className="vrf-connection-wrapper">
            <div className="new-vrf-top-bar">
                <div>
                    {routeProps.location.pathname}
                </div>
                <div><button className="btn red-button" onClick={logClick3}>Delete</button></div>
            </div>
            <div>
                new connection table
            </div>
        </div>
    );
}
