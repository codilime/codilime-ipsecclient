import React, { useState } from "react";
import "./NewEndpointRow.scss";

export default function NewEndpointRow(props) {
  const hardwareSupport = props.hardwareSupport;
  const forceNumberMinMax = props.forceNumberMinMax;

  const [remote_ip_sec, updateRemote_ip_sec] = useState("");
  const [local_ip, updateLocal_ip] = useState("");
  const [peer_ip, updatePeer_ip] = useState("");
  const [psk, updatePsk] = useState("");
  const [remote_as, updateRemote_as] = useState("1");
  const [nat, updateNat] = useState(false);
  const [bgp, updateBgp] = useState(false);

  function natCheckboxHandler() {
    updateNat(!nat);
  }

  function bgpCheckboxHandler() {
    updateBgp(!bgp);
  }

  function renderTableRowForSoftwareSupport() {
    return (
      <tr>
        <td>
          <input
            type="text"
            placeholder="i.e. 192.158.1.38"
            name="remote_ip_sec"
            id="remote_ip_sec"
            onChange={(event) => updateRemote_ip_sec(event.target.value)}
          />
        </td>
        <td>
          <input
            type="text"
            placeholder="i.e. 192.158.1.38"
            name="local_ip"
            id="local_ip"
            onChange={(event) => updateLocal_ip(event.target.value)}
          />
        </td>
        <td>
          <input
            type="text"
            placeholder="i.e. 192.158.1.38"
            name="peer_ip"
            id="peer_ip"
            onChange={(event) => updatePeer_ip(event.target.value)}
          />
        </td>

        <td>
          <input
            type="password"
            placeholder="password"
            name="psk"
            id="psk"
            onChange={(event) => updatePsk(event.target.value)}
          />
        </td>
        <td>
          <input
            type="checkbox"
            name="nat"
            id="nat"
            checked={nat}
            onChange={natCheckboxHandler}
          />
        </td>
        <td>
          <input
            type="checkbox"
            name="bgp"
            id="bgp"
            checked={bgp}
            onChange={bgpCheckboxHandler}
          />
        </td>
        <td>
          <input type="button" name="add" id="add_endpoint" value="Add" />
        </td>
      </tr>
    );
  }

  function renderTableRowForHardwareSupport() {
    return (
      <tr>
        <td>
          <input
            type="text"
            placeholder="i.e. 192.158.1.38"
            name="remote_ip_sec"
            id="remote_ip_sec"
            onChange={(event) => updateRemote_ip_sec(event.target.value)}
          />
        </td>
        <td>
          <input
            type="text"
            placeholder="i.e. 192.158.1.38"
            name="local_ip"
            id="local_ip"
            onChange={(event) => updateLocal_ip(event.target.value)}
          />
        </td>
        <td>
          <input
            type="text"
            placeholder="i.e. 192.158.1.38"
            name="peer_ip"
            id="peer_ip"
            onChange={(event) => updatePeer_ip(event.target.value)}
          />
        </td>

        <td>
          <input
            type="password"
            placeholder="password"
            name="psk"
            id="psk"
            onChange={(event) => updatePsk(event.target.value)}
          />
        </td>
        <td>
          <input
            type="number"
            min="1"
            max="4094"
            name="remote_as"
            id="remote_as"
            step="1"
            value={remote_as}
            onChange={(event) => updateRemote_as(forceNumberMinMax(event))}
          />
        </td>
        <td>
          <input
            type="text"
            placeholder="i.e. some_name"
            name="source_interface"
            id="source_interface"
          />
        </td>
        <td>
          <input
            type="checkbox"
            name="bgp"
            id="bgp"
            checked={bgp}
            onChange={bgpCheckboxHandler}
          />
        </td>
        <td>
          <input type="button" name="add" id="add_endpoint" value="Add" />
        </td>
      </tr>
    );
  }
  return hardwareSupport
    ? renderTableRowForHardwareSupport()
    : renderTableRowForSoftwareSupport();
}
