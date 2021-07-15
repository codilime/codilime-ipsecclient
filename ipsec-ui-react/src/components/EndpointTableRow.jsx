import React  from "react";
import {v4 as uuidv4} from "uuid";
import EndpointTableCell from "./EndpointTableCell";

export default function EndpointTableRow(endpoints) {
    const endpointData = endpoints.endpoints;

    console.log("dump value in TableRow: ", endpointData)

    return (
        <tr>
            <EndpointTableCell thisEndpoint={endpointData}/>
            <td>
                <button className="btn edit-btn">...</button>
            </td>
        </tr>
    )
}
