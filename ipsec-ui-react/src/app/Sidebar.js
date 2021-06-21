import React from 'react';
import './Sidebar.scss';
import {HashRouter as Router, Switch, Link} from 'react-router-dom';



export default function Sidebar() {
    function clickTester() {
        console.log("list links are working");
    }
    return (
        <Router>
            <div className="sidebar-container">
                <div>
                    <ul>
                        <li onClick={clickTester}>
                            <Link to="/vrf/V101:U">V101:U</Link>
                        </li>
                        <li onClick={clickTester}>
                            <Link to="/vrf/V102:SoccerOnline">V102:SoccerOnline</Link>
                        </li>
                        <li onClick={clickTester}>
                            <Link to="/vrf/V103:BigBank">V103:BigBank</Link>
                        </li>
                        <li onClick={clickTester}>
                            <Link to="/vrf/V104:BranchOffice">V104:BranchOffice</Link>
                        </li>
                        <li onClick={clickTester}>
                            <Link to="/vrf/V105:test">V105:test</Link>
                        </li>
                        <li onClick={clickTester}>
                            <Link to="/VRF/CREATE">
                                <button className="btn new-vrf-button">Add a new VRF</button>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
     </Router>
    );
}

