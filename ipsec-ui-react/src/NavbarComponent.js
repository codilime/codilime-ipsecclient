import React from 'react';
import ciscoLogo from './images/cisco_logo.png';
import './NavbarComponent.scss';

export default function SideBarComponent(props) {
    return (
        <div className="navbar-container">
            <img src={ciscoLogo} />
            <p>
                Product name
            </p>
        </div>

)
}