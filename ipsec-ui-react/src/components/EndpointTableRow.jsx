import React from "react";

import { v4 as uuidv4 } from "uuid";

import EndpointTableCell from "./EndpointTableCell";

export default function EndpointTableRow(props) {
    const endpointInRowComponent = props.endpoint;
    const hardwareSupport = props.hardwareSupport;

    const tableColumnsWithSoftware = [
        "remote_ip_sec",
        "local_ip",
        "peer_ip",
        "psk",
        "nat",
        "bgp",
    ];
    const tableColumnsWithHardware = [
        "remote_ip_sec",
        "local_ip",
        "peer_ip",
        "psk",
        "remote_as",
        "source_interface",
        "bgp",
    ];
    const table = hardwareSupport
        ? tableColumnsWithHardware
        : tableColumnsWithSoftware;

    if (endpointInRowComponent) {
        return (
            <tr>
                {table.map((fieldName) => {
                    return (
                        <EndpointTableCell
                            key={uuidv4()}
                            endpointTableValue={
                                endpointInRowComponent[fieldName]
                            }
                        />
                    );
                })}
                <td>
                    <button className="btn edit-btn">...</button>
                </td>
            </tr>
        );
    }
}
