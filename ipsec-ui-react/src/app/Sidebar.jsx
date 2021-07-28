import React from "react";

import { Link } from "react-router-dom";

import { v4 as uuidv4 } from "uuid";

import Button from "../components/Button";
import "./Sidebar.scss";

export default function Sidebar(props) {
    const VRFList = props.VRFConnections;

    return (
        <div className="sidebar-container">
            {(!VRFList || VRFList.length === 0) && <p className="sidebar-text">no connections</p>}
            <ul className="sidebar-list">
                {VRFList && VRFList.map((item) => (
                    <li key={uuidv4()}>
                        <Link to={"/vrf/" + item.id} replace>
                            {item.client_name}
                        </Link>
                    </li>
                ))}
                <li>
                    <Link to="/vrf/create" replace>
                        <Button
                            className="btn new-vrf-button"
                            textValue="Add a new VRF"
                        />
                    </Link>
                </li>
            </ul>
        </div>
    );
}
