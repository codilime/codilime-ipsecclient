import React from "react";

export default function EndpointTableCell(props) {
    const cellValue = props.endpointTableValue;
    console.log(cellValue);

    if(typeof cellValue === "boolean") {
        if(cellValue === true) {
            return (
                <td>
                    <input type="checkbox" checked />
                </td>
            )
        } return (
            <td>
                <input type="checkbox" />
            </td>
        )
    }

    return (
        <td>
            {cellValue}
        </td>
    )
}
