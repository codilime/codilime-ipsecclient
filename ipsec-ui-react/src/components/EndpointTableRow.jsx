import React  from "react";
import EndpointTableCell from "./EndpointTableCell";
import {v4 as uuidv4} from "uuid";

export default function EndpointTableRow(props) {
    const endpointInRowComponent = props.endpoint;
    const hardwareSupport = props.hardwareSupport;

    const tableColumnsWithSoftware = ['remote_ip_sec', 'local_ip', 'peer_ip', 'psk', 'nat', 'bgp'];
    const tableColumnsWithHardware = ['remote_ip_sec', 'local_ip', 'peer_ip', 'psk', 'remote_as', 'source_interface', 'bgp'];

    if (endpointInRowComponent) {
        return (
            <tr>
                {Object.keys(endpointInRowComponent).map((key) => {
                    if (
                        hardwareSupport === true && tableColumnsWithHardware.includes(key) ||
                        hardwareSupport === false && tableColumnsWithSoftware.includes(key)
                    ) {
                        return (
                            <EndpointTableCell
                                key={uuidv4()}
                                endpointTableValue={endpointInRowComponent[key]}
                            />
                        )
                    }
                    return null;
                })}
                <td>
                    <button className="btn edit-btn">...</button>
                </td>
            </tr>
        )
    }
}
