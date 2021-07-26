import React, {useState} from "react";


export default function NewEndpointRow(props) {
    const hardwareSupport = props.hardwareSupport;

    const [remoteIpSec, updateRemoteIpSec] = useState("");
    const [localIp, updateLocalIp] = useState("");
    const [peer_ip, updatePeer_ip] = useState("");




    function renderTableRowForSoftwareSupport() {
        return (
            <tr>
                <td>
                    <input type="text"
                           placeholder="i.e. 127.000.8.123"
                           name="remote_ip_sec"
                           id="remote_ip_sec"
                           onChange={event => updateRemoteIpSec(event.target.value)}
                    />
                </td>
                <td>
                    <input type="text"
                           placeholder="i.e. 127.000.8.123"
                           name="local_ip"
                           id="local_ip"
                           onChange={event => updateLocalIp(event.target.value)}
                    />
                </td>
                <td>
                    <input type="text"
                           placeholder="i.e. 127.000.8.123"
                           name="peer_ip"
                           id="peer_ip"
                           onChange={event => updatePeer_ip(event.target.value)}
                    />
                </td>

                <td>
                    <input type="password"
                           placeholder="password"
                           name="psk"
                           id="psk"
                    />
                </td>
                <td>
                    <input type="checkbox"
                           name="nat"
                           id="nat"
                    />
                </td>
                <td>
                    <input type="checkbox"
                           name="bgp"
                           id="bgp"
                    />
                </td>
                <td>
                    <input type="button"
                           name="add"
                           id="add"
                           value="Add"
                    />
                </td>
            </tr>
        )
    }

    function renderTableRowForHardwareSupport() {
        return (
            <tr>
                <td>
                    <input type="text"
                           placeholder="i.e. 127.000.8.123"
                           name="remote_ip_sec"
                           id="remote_ip_sec"
                           onChange={event => updateRemoteIpSec(event.target.value)}
                    />
                </td>
                <td>
                    <input type="text"
                           placeholder="i.e. 127.000.8.123"
                           name="local_ip"
                           id="local_ip"
                           onChange={event => updateLocalIp(event.target.value)}
                    />
                </td>
                <td>
                    <input type="text"
                           placeholder="i.e. 127.000.8.123"
                           name="peer_ip"
                           id="peer_ip"
                           onChange={event => updatePeer_ip(event.target.value)}
                    />
                </td>

                <td>
                    <input type="password"
                           placeholder="password"
                           name="psk"
                           id="psk"
                    />
                </td>
                <td>
                    <input type="number"
                           min="1"
                           max="4094"
                           name="local_as" id="local_as"
                           step="1"
                    />
                </td>
                <td>
                    <input type="text"
                           placeholder="i.e. some_name"
                           name="source_interface"
                           id="source_interface"
                    />
                </td>
                <td>
                    <input type="checkbox"
                           name="bgp"
                           id="bgp"
                    />
                </td>
                <td>
                    <input type="button"
                           name="add"
                           id="add"
                           value="Add"
                    />
                </td>
            </tr>
        )
    }
    return (hardwareSupport) ? renderTableRowForHardwareSupport() : renderTableRowForSoftwareSupport();
}