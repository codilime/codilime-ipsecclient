import React from "react";

import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import "./Sidebar.scss";

export default function Sidebar(props) {
    const VRFList = props.VRFConnections;

    return (
        <div className="sidebar-container">
            {(!VRFList || VRFList.length === 0) && <p>no connections</p>}
            <ul>
                {VRFList && VRFList.map((item) => (
                    <li key={uuidv4()}>
                        <Link to={"/vrf/" + item.id} replace>
                            {item.client_name}
                        </Link>
                    </li>
                ))}
                <li>
                    <Link to="/vrf/create" replace>
                        <button className="btn new-vrf-button">
                            Add a new VRF
                        </button>
                    </Link>
                </li>
            </ul>
        </div>
    );
}
