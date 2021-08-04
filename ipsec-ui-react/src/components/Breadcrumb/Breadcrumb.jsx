import React from "react";

import "./Breadcrumb.scss";

export default function Breadcrumb(props) {
    const { vrfAddress, connectionType, className } = props;

    return (
        <div>
            / {connectionType} / <span className={className}>{vrfAddress}</span>
        </div>
    );
}
