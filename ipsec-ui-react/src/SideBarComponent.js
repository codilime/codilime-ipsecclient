import React from 'react';
import './SideBarComponent.scss';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';

import ciscoLogo from './images/cisco_logo.png';

export default function SideBarComponent(props) {
    return (
        <div className="sidebar-container">
            <ul>
                <li>
                    V101:U
                </li>
                <li>
                    V102:SoccerOnline
                </li>
                <li>
                    V103:BigBank
                </li>
                <li>
                    Add a new VRF
                </li>
            </ul>
        </div>
    )
}