import React, { useState } from 'react';

import { Button } from '../Button';
import { forceNumberClamp } from '../../utils/formatters';
import './NewEndpointRow.scss';
import { maxValueForRemoteAS } from '../../constants';

export default function NewEndpointRow({ hardwareSupport }) {
  const [remoteIPSec, updateRemoteIPSec] = useState('');
  const [localIP, updateLocalIP] = useState('');
  const [peerIP, updatePeerIP] = useState('');
  const [psk, updatePsk] = useState('');
  const [remoteAS, updateRemoteAS] = useState('1');
  const [source_interface, updateSource_interface] = useState('');
  const [nat, updateNat] = useState(false);
  const [bgp, updateBgp] = useState(false);

  function handleNATChange() {
    updateNat(!nat);
  }

  function handleBGPChange() {
    updateBgp(!bgp);
  }

  function handleClick(event) {
    event.preventDefault();
    console.log('button is clicked');
  }

  if (hardwareSupport) {
    return (
      <tr>
        <td>
          <input type="text" placeholder="i.e. 192.158.1.38" name="remote_ip_sec" id="remote_ip_sec" onChange={(event) => updateRemoteIPSec(event.target.value)} />
        </td>
        <td>
          <input type="text" placeholder="i.e. 192.158.1.38" name="local_ip" id="local_ip" onChange={(event) => updateLocalIP(event.target.value)} />
        </td>
        <td>
          <input type="text" placeholder="i.e. 192.158.1.38" name="peer_ip" id="peer_ip" onChange={(event) => updatePeerIP(event.target.value)} />
        </td>

        <td>
          <input type="password" placeholder="password" name="psk" id="psk" onChange={(event) => updatePsk(event.target.value)} />
        </td>
        <td>
          <input
            type="number"
            min="1"
            max={maxValueForRemoteAS}
            name="remote_as"
            id="remote_as"
            step="1"
            value={remoteAS}
            onChange={(event) => updateRemoteAS(forceNumberClamp(event.target.value, event.target.min, event.target.max))}
          />
        </td>
        <td>
          <input type="text" placeholder="i.e. some_name" name="source_interface" id="source_interface" onChange={(event) => updateSource_interface(event.target.value)} />
        </td>
        <td>
          <input type="checkbox" name="bgp" id="bgp" checked={bgp} onChange={handleBGPChange} />
        </td>
        <td>
          <Button name="add" className="btn" textValue="Add" handleClick={handleClick} />
        </td>
      </tr>
    );
  } else {
    return (
      <tr>
        <td>
          <input type="text" placeholder="i.e. 192.158.1.38" name="remote_ip_sec" id="remote_ip_sec" onChange={(event) => updateRemoteIPSec(event.target.value)} />
        </td>
        <td>
          <input type="text" placeholder="i.e. 192.158.1.38" name="local_ip" id="local_ip" onChange={(event) => updateLocalIP(event.target.value)} />
        </td>
        <td>
          <input type="text" placeholder="i.e. 192.158.1.38" name="peer_ip" id="peer_ip" onChange={(event) => updatePeerIP(event.target.value)} />
        </td>

        <td>
          <input type="password" placeholder="password" name="psk" id="psk" onChange={(event) => updatePsk(event.target.value)} />
        </td>
        <td>
          <input type="checkbox" name="nat" id="nat" checked={nat} onChange={handleNATChange} />
        </td>
        <td>
          <input type="checkbox" name="bgp" id="bgp" checked={bgp} onChange={handleBGPChange} />
        </td>
        <td>
          <Button name="add" className="btn" textValue="Add" handleClick={handleClick} />
        </td>
      </tr>
    );
  }
}
