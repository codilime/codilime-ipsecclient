import React from 'react';
import './NewVRFComponent.scss'

export default function ({routeProps}) {
    console.log({routeProps});

    return (
        <div className="new-vrf-connection">
            {routeProps.location.pathname}
                <tbody>
                    <tr>
                        <th>Name: </th>
                        <th>Active []</th>
                    </tr>
                </tbody>
        </div>
    );
}
