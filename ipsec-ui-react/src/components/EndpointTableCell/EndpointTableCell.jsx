import React from "react";

export default function EndpointTableCell(props) {
    const value = props.value;

    function checkboxTemporaryHandler() {
        console.log("changing");
    }

    if (typeof value === "boolean") {
        if (value === true) {
            return (
                <td>
                    <input
                        type="checkbox"
                        checked
                        onChange={checkboxTemporaryHandler}
                    />
                </td>
            );
        }
        return (
            <td>
                <input type="checkbox" onChange={checkboxTemporaryHandler} />
            </td>
        );
    }

    return <td>{value}</td>;
}
