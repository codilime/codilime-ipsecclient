import React from "react";

import "./Button.scss";

export default function Button(props) {
    const { className, textValue } = props;

    return <button className={className}>{textValue}</button>;
}
