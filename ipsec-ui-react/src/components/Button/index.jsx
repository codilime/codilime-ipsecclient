import React from "react";

import "./Button.scss";

export function Button({ className, textValue, handleClick }) {

    return (
        <button {...{ className, onClick: handleClick }}>{textValue}</button>
    );
}
