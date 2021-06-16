import React from 'react';
import './NewVRFComponent.scss'

export default function ({routeProps}) {
    console.log({routeProps});

    return (
        <div className="new-vrf-connection">
            {routeProps.location.pathname}
            <div className="new-vrf-details">
                placeholder for name, vlan, crypto phase 1 & 2, active checkbox and bgp
            </div>
            <div className="endpoints-details">
                placeholder for table with endpoints
            </div>
            <div className="visualization">
                placeholder for connections visualization
            </div>
        </div>
    );
}
