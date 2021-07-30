import React from "react";

import "./Breadcrumb.scss";

export default function Breadcrumb(props) {
    const { vrfAddress } = props;

    return (
        <div>
            / vrf / <span className="active-vrf">{vrfAddress}</span>
        </div>
    );
}
