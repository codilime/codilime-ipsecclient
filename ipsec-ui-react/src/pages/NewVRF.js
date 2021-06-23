import React from 'react';
import './NewVRF.scss'

export default function NewVRF({routeProps}) {

    return (
        <div className="new-vrf-connection-wrapper">
            <div className="new-vrf-top-bar">
                {routeProps.location.pathname}
                {/*<button className="btn red-button" onClick={logClick3}>Delete</button>*/}
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
