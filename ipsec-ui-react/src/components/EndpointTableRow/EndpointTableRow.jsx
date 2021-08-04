import React from "react";

import { v4 as uuidv4 } from "uuid";

import EndpointTableCell from "../EndpointTableCell/EndpointTableCell";
import { Button } from "../Button";

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
                            key={fieldName}
                            value={endpoint[fieldName]}
                        />
                    );
                })}
                <td>
                    <Button className="btn edit-btn" textValue="..." />
                </td>
            </tr>
        );
    }
}
