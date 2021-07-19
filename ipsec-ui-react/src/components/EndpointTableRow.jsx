import React  from "react";
import EndpointTableCell from "./EndpointTableCell";

export default function EndpointTableRow(endpoint) {
    const endpointInRowComponent = endpoint.endpoint;

    console.log("dump value in TableRow: ", endpointInRowComponent)

    if(endpointInRowComponent) {
        return (
            <tr>
                {Object.entries(endpointInRowComponent).map(([key, value]) => {
                    return (
                        <td key={key}>{value}</td>
                        // <EndpointTableCell endpointTableValue={value} />
                    )
                })}
                <td>
                    <button className="btn edit-btn">...</button>
                </td>
            </tr>
        )
    }
}
