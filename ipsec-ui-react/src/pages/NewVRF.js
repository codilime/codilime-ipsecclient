import React from 'react';
import './NewVRF.scss'
import Dump from "../components/Dump";

export default function NewVRF({routeProps, cryptoPhaseEncryption}) {

    return (
        <div className="new-vrf-connection-wrapper">
            <div className="new-vrf-top-bar">
                {routeProps.location.pathname}
            </div>
            <div className="new-vrf-data-container">
                aa
            </div>
            <div className="new-vrf-data-container">
                endpoints table
            </div>
            <div className="new-vrf-data-container">
                visualization
            </div>
            <Dump value={cryptoPhaseEncryption} />
        </div>
    );
}
