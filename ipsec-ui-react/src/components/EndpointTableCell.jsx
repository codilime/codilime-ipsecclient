import React, {useEffect} from "react";
import Dump from "./Dump";
import {renderToString} from "react-dom/server";

export default function EndpointTableCell(thisEndpoint) {
    const data = thisEndpoint.thisEndpoint;

    return (
        <>
            <td>
                <div>{data.remote_ip_sec}</div>
            </td>
            <td>
                <div>{data.local_ip}</div>
            </td>
            <td>
                <div>{data.peer_ip}</div>
            </td>
            <td>
                <div>{data.psk}</div>
            </td>
            <td>
                <div>nat value</div>
            </td>
            <td>
                <div>bgp value</div>
            </td>
            <td>
                <div>button</div>
            </td>
        </>

    )
}
