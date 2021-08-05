import React, { useEffect, useState } from 'react';

import { useHistory } from 'react-router';

import axios from 'axios';

import './NewVRF.scss';
import { maxValueForLocalAS, maxValueForVlan } from '../../../constants';

import NewEndpointRow from '../../NewEndpointRow/NewEndpointRow';
import EndpointTableHeader from '../../EndpointTableHeader/EndpointTableHeader';
import Breadcrumb from '../../Breadcrumb/Breadcrumb';
import { forceNumberClamp } from '../../../utils/formatters';
import CryptoHandler from '../../CryptoHandler/CryptoHandler';
import { Button } from '../../index';

export default function NewVRF(props) {
  const history = useHistory();

  const { softwareEncryption, hardwarePh1Encryption, hardwarePh2Encryption, updateSidebar } = props;

  useEffect(() => {
    updateArrayForCryptoPh1(softwareEncryption);
    updateArrayForCryptoPh2(softwareEncryption);
  }, [softwareEncryption]);

  const [vrfName, updateVrfName] = useState('');
  const [lanIpMask, updateLanIpMask] = useState('');
  const [active, updateActive] = useState(false);
  const [hardwareSupport, updateHardwareSupport] = useState(false);
  const [physicalInterface, updatePhysicalInterface] = useState('');
  const [vlanValue, updateVlanValue] = useState('1');
  const [bgpValue, updateBgpValue] = useState('1');
  const [cryptoPh1_1, updateCryptoPh1_1] = useState('');
  const [cryptoPh1_2, updateCryptoPh1_2] = useState('');
  const [cryptoPh1_3, updateCryptoPh1_3] = useState('');
  const [cryptoPh2_1, updateCryptoPh2_1] = useState('');
  const [cryptoPh2_2, updateCryptoPh2_2] = useState('');
  const [cryptoPh2_3, updateCryptoPh2_3] = useState('');

  const [arrayForCryptoPh1, updateArrayForCryptoPh1] = useState(softwareEncryption);
  const [arrayForCryptoPh2, updateArrayForCryptoPh2] = useState(softwareEncryption);

  const payload = {
    client_name: vrfName,
    lan_ip: lanIpMask,
    physical_interface: physicalInterface,
    hardware_support: hardwareSupport,
    active: active,
    vlan: parseInt(vlanValue, 10),
    crypto_ph1: [cryptoPh1_1, cryptoPh1_2, cryptoPh1_3],
    crypto_ph2: [cryptoPh2_1, cryptoPh2_2, cryptoPh2_3],
    local_as: parseInt(bgpValue, 10),
    endpoints: null
  };

  function pushNewVrfConnection(event) {
    event.preventDefault();
    axios({
      method: 'post',
      url: 'api/vrfs',
      data: payload
    }).then(
      (response) => {
        console.log(response.data.id);
        updateSidebar();
        history.push('/vrf/' + response.data.id);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  const handleActiveChange = () => {
    updateActive(!active);
  };

  const hardwareSupportCheckboxHandler = () => {
    updateHardwareSupport(!hardwareSupport);

    if (hardwareSupport === true) {
      updateArrayForCryptoPh1(softwareEncryption);
      updateArrayForCryptoPh2(softwareEncryption);
    } else {
      updateArrayForCryptoPh1(hardwarePh1Encryption);
      updateArrayForCryptoPh2(hardwarePh2Encryption);
    }
  };

  function addEndpointsToPayload() {
    console.log("I'm adding this endpoint to the payload");
  }

  return (
    <div className="new-vrf-connection-wrapper">
      <div className="new-vrf-top-bar">
        <Breadcrumb vrfAddress={'New VRF'} connectionType="VRFs" className="active-vrf" />
      </div>
      <div className="new-vrf-data-container">
        <div className="vrf-section-header">VRF Details</div>
        <form>
          <div className="vrf-column-1">
            <div className="vrf-column-1-item">
              <label htmlFor="client_name">Name:</label>
              <input type="text" placeholder="set VRF name" name="client_name" id="client_name" onChange={(event) => updateVrfName(event.target.value)} /> <br />
              <label htmlFor="lan_ip">LAN IP/Mask:</label>
              <input type="text" placeholder="set LAN mask" name="lan_ip" id="lan_ip" onChange={(event) => updateLanIpMask(event.target.value)} /> <br />
              <label htmlFor="physical_interface">Physical interface:</label>
              <input type="text" placeholder="eth0" name="physical_interface" id="physical_interface" onChange={(event) => updatePhysicalInterface(event.target.value)} />
            </div>
            <div className="vrf-column-checkbox-item">
              <input type="checkbox" name="active" id="active" checked={active} onChange={handleActiveChange} />
              <label id="checkbox-label" htmlFor="active">
                Active
              </label>
              <input type="checkbox" name="hardware_support" id="hardware_support" checked={hardwareSupport} onChange={hardwareSupportCheckboxHandler} />
              <label id="checkbox-label" htmlFor="hardware_support">
                Hardware support
              </label>
            </div>
            <Button className="btn save-changes-btn" id="submit-vrf-button" handleClick={pushNewVrfConnection} textValue="Save changes" />
          </div>
          <div className="vrf-column-2">
            <div className="vrf-column-item-number">
              <label htmlFor="local_as">BGP local AS</label>
              <input
                type="number"
                min="1"
                max={maxValueForLocalAS}
                name="local_as"
                id="local_as"
                step="1"
                value={bgpValue}
                onChange={(event) => updateBgpValue(forceNumberClamp(event.target.value, event.target.min, event.target.max))}
              />
            </div>
            <div className="vrf-column-item-number">
              <label htmlFor="vlan">VLAN</label>
              <input
                type="number"
                min="1"
                max={maxValueForVlan}
                name="vlan"
                id="vlan"
                step="1"
                value={vlanValue}
                onChange={(event) => updateVlanValue(forceNumberClamp(event.target.value, event.target.min, event.target.max))}
              />
            </div>
          </div>

          <div className="vrf-column-3">
            <CryptoHandler
              title={'Crypto phase 1'}
              softwareEncryption={softwareEncryption}
              hardwarePh1Encryption={hardwarePh1Encryption}
              hardwarePh2Encryption={hardwarePh2Encryption}
              hardwareSupport={hardwareSupport}
              arrayForCrypto={arrayForCryptoPh1}
              valuePh1={cryptoPh1_1}
              valuePh2={cryptoPh1_2}
              valuePh3={cryptoPh1_3}
              updatePh1={updateCryptoPh1_1}
              updatePh2={updateCryptoPh1_2}
              updatePh3={updateCryptoPh1_3}
            />
            <CryptoHandler
              title={'Crypto phase 2'}
              softwareEncryption={softwareEncryption}
              hardwarePh1Encryption={hardwarePh1Encryption}
              hardwarePh2Encryption={hardwarePh2Encryption}
              hardwareSupport={hardwareSupport}
              arrayForCrypto={arrayForCryptoPh2}
              valuePh1={cryptoPh2_1}
              valuePh2={cryptoPh2_2}
              valuePh3={cryptoPh2_3}
              updatePh1={updateCryptoPh2_1}
              updatePh2={updateCryptoPh2_2}
              updatePh3={updateCryptoPh2_3}
            />
          </div>
        </form>
      </div>
      {/*<div className="vrf-detail-section-container">*/}
      {/*  <div className="vrf-section-header">Endpoints</div>*/}
      {/*  <table className="endpoints-table">*/}
      {/*    <thead>*/}
      {/*      <EndpointTableHeader hardwareSupport={hardwareSupport} />*/}
      {/*    </thead>*/}
      {/*    <tbody>*/}
      {/*      <NewEndpointRow hardwareSupport={hardwareSupport} />*/}
      {/*    </tbody>*/}
      {/*  </table>*/}
      {/*  <Button className="btn endpoint-btn" handleClick={addEndpointsToPayload} textValue="Add new endpoint" />*/}
      {/*</div>*/}
      {/*<Dump value={} />*/}
    </div>
  );
}
