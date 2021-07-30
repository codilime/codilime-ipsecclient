import React from "react";

import "./Button.scss";

export default function Button(props) {
    const { className, textValue, changeHandler } = props;

    return (
        <button className={className} onClick={changeHandler}>
            {textValue}
        </button>
    );
}
