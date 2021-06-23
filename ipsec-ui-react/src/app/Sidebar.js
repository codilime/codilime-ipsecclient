import React from 'react';
import './Sidebar.scss';
import {HashRouter as Router, Link} from 'react-router-dom';

export default function Sidebar(props) {
    // console.log("tutaj typeof: ", typeof props.VRFConnections);
    // console.log("tutaj length: ", props.VRFConnections.length);

    const VRFList = props.VRFConnections


    return (
        <Router>
            <div className="sidebar-container">
                <ul>
                    {VRFList.map((item) => (
                        <li key={item.id}>
                            <Link to={item.client_name}>
                                {item.client_name}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link to="/VRF/CREATE">
                            <button className="btn new-vrf-button">Add a new VRF</button>
                        </Link>
                    </li>
                </ul>
            </div>
     </Router>
    );
}

