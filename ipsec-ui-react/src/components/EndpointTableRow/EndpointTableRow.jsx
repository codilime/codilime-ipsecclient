import React from "react";

import { v4 as uuidv4 } from "uuid";

import EndpointTableCell from "../EndpointTableCell/EndpointTableCell";

export default function EndpointTableRow(props) {
    const { endpoint, hardwareSupport } = props;

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

    if (endpoint) {
        return (
            <tr>
                {table.map((fieldName) => {
                    return (
                        <EndpointTableCell
                            key={uuidv4()}
                            endpointTableValue={endpoint[fieldName]}
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
