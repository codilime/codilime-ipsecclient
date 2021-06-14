import React from 'react';
import ciscoLogo from './images/cisco_logo.png';
import './NavbarComponent.scss';

export default function SideBarComponent(props) {
    return (
        <div className="navbar-container">
            <img className="navbar-item" src={ciscoLogo} />
            <p className="navbar-item">
                Product name
            </p>
        </div>
    )
}