import React from 'react';
import ciscoLogo from '../assets/cisco_logo.png';
import './TopBar.scss';

export default function TopBar() {
    return (
        <div className="topbar-container">
            <img className="topbar-item" src={ciscoLogo} alt="cisco logo"/>
            <p className="topbar-item">
                Product name
            </p>
        </div>
    )
}