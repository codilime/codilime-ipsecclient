import React from 'react';
import ciscoLogo from './images/cisco_logo.png';
import './TopBarComponent.scss';

export default function TopBarComponent(props) {
    return (
        <div className="topbar-container">
            <img className="topbar-item" src={ciscoLogo} />
            <p className="topbar-item">
                Product name
            </p>
        </div>
    )
}