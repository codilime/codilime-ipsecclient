import React from 'react';
import ciscoLogo from './images/cisco_logo.png';
import './TopBar.scss';

export default function TopBar(props) {
    return (
        <div className="topbar-container">
            <img className="topbar-item" src={ciscoLogo} />
            <p className="topbar-item">
                Product name
            </p>
        </div>
    )
}