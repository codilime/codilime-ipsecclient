import React from "react";

import "./TopBar.scss";
import ciscoLogo from "../assets/cisco_logo.png";

export default function TopBar() {
    return (
        <div className="topbar-container">
            <img className="topbar-item" src={ciscoLogo} alt="cisco logo" />
            <p className="topbar-item">IPsec User Interface</p>
        </div>
    );
}
