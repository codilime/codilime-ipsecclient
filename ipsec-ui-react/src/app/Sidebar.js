import React from 'react';
import './Sidebar.scss';
import {Link} from 'react-router-dom';

export default function Sidebar(props) {
    function onClick() {
        console.log("I am click");
    }
    // console.log("tutaj typeof: ", typeof props.VRFConnections);
    // console.log("tutaj length: ", props.VRFConnections.length);

    const VRFList = props.VRFConnections

    if(VRFList.length > 0) {
        return (
            <div className="sidebar-container">
                <ul>
                    {VRFList.map((item, index) => (
                        <li key={item.id}>
                            <Link to={"/vrf/" + index} replace >
                                {item.client_name}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link to="/vrf/create" replace >
                            <button className="btn new-vrf-button" onClick={onClick}>Add a new VRF</button>
                        </Link>
                    </li>
                </ul>
            </div>
        );
    } else {
        return (
            <div className="sidebar-container">
                <p>No VRF connections</p>
                <ul>
                    <li>
                        <Link to="/vrf/create" replace >
                            <button className="btn new-vrf-button" onClick={onClick}>Add a new VRF</button>
                        </Link>
                    </li>
                </ul>
            </div>
        )
    }
}

