import React from 'react';
import './Sidebar.scss';
import {Link} from 'react-router-dom';
import {v4 as uuidv4} from 'uuid';
import Dump from "../components/Dump";

export default function Sidebar(props) {

    const VRFList = props.VRFConnections;

    if(VRFList.length > 0) {
        return (
            <div className="sidebar-container">
                <ul>
                    {VRFList.map((item, index) => (
                        <li key={uuidv4()}>
                            <Link to={"/vrf/" + index} replace >
                                {item.client_name}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link to="/vrf/create" replace >
                            <button className="btn new-vrf-button">Add a new VRF</button>
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
                            <button className="btn new-vrf-button">Add a new VRF</button>
                        </Link>
                    </li>
                </ul>
            </div>
        )
    }
}