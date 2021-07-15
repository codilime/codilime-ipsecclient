import React, {useState} from "react";
import Dump from "./Dump";
import {v4 as uuidv4} from "uuid";
import EndpointTableCell from "./EndpointTableCell";

export default function EndpointTableRow(endpoints) {
    const endpointData = endpoints.endpoints;

    console.log("dump value in TabeRow: ", endpointData)

    return (
        <tr>
           <EndpointTableCell thisEndpoint={endpointData}/>
        </tr>
    )
}
