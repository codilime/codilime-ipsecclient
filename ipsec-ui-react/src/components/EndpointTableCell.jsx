import React from "react";

export default function EndpointTableCell(props) {
    const cellValue = props.endpointTableValue;

    return (
        <td>
            {cellValue}
        </td>
    )
}
