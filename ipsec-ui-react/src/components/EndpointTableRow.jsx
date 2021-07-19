import React  from "react";
import {v4 as uuidv4} from "uuid";
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
                    )
                })}
                <td>
                    <button className="btn edit-btn">...</button>
                </td>
            </tr>
        )
    }
}
