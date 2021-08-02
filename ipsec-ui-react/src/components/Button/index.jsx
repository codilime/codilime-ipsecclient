import React from "react";

import "./Button.scss";

export function Button({ className, textValue, changeHandler }) {
    //const { className, textValue, changeHandler } = props;

    return (
        <button {...{ className, onClick: changeHandler }}>{textValue}</button>
    );
}
