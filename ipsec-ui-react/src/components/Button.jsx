import React from "react";

import './Button.scss'

export default function Button (props) {
    const className = props.className;
    const textValue = props.textValue;

    return (
        <button className={className}>
            {textValue}
        </button>
    )
}