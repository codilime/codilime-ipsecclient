import React, { useState, useEffect } from 'react';

import { useHistory, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { v4 as uuidv4 } from 'uuid';
import { boolean, number } from 'yup';

import './DetailVRF.scss';
import '../NewVRF/NewVRF.scss';
import { maxValueForLocalAS, maxValueForVlan } from '../../../constants';

import EndpointTableRow from '../../EndpointTableRow/EndpointTableRow';
import NewEndpointRow from '../../NewEndpointRow/NewEndpointRow';
import CryptoHandler from '../../CryptoHandler/CryptoHandler';
import EndpointTableHeader from '../../EndpointTableHeader/EndpointTableHeader';
import { Button } from 'components';
import Breadcrumb from '../../Breadcrumb/Breadcrumb';

import Dump from '../../../utils/Dump';
import Loader from '../../Loader/Loader';
// import { forceNumberClamp } from '../../utils/formatters';
import { client } from '../../../_api';
import { vrfSchema } from '../../../schema';

const detailForm = [
  {
    type: 'text',
    name: 'client_name',
    placeholder: 'i. e. VRF1 Work Office'
  },
  {
    type: 'text',
    name: 'lan_ip',
    placeholder: 'i. e. secret_agent'
  },
  {
    type: 'text',
    name: 'physical_interface',
    placeholder: 'i. e. eth0'
  },
  {
    type: 'checkbox',
    name: 'active'
  },
  {
    type: 'checkbox',
    name: 'hardware_support'
  },
  {
    type: 'number',
    name: 'local_as'
  },
  {
    type: 'number',
    name: 'vlan'
  }
];

export default function DetailViewVrf(props) {
  const { id } = useParams();
  const history = useHistory();
  const { register, handleSubmit, errors } = useForm({ resolver: yupResolver(vrfSchema) });

  const { softwareEncryption, hardwarePh1Encryption, hardwarePh2Encryption, updateSidebar } = props;

  const [detailVrf, updateDetailVrf] = useState();
  const [loading, updateLoading] = useState(true);

  const [vrfName, updateVrfName] = useState(vrfName);
  const [lanIpMask, updateLanIpMask] = useState(lanIpMask);
  const [physicalInterface, updatePhysicalInterface] = useState(physicalInterface);
  const [active, updateActive] = useState(active);
  const [hardwareSupport, updateHardwareSupport] = useState(hardwareSupport);
  const [vlanValue, updateVlanValue] = useState(vlanValue);
  const [bgpValue, updateBgpValue] = useState(bgpValue);
  const [cryptoPh1_1, updateCryptoPh1_1] = useState(cryptoPh1_1);
  const [cryptoPh1_2, updateCryptoPh1_2] = useState(cryptoPh1_2);
  const [cryptoPh1_3, updateCryptoPh1_3] = useState(cryptoPh1_3);
  const [cryptoPh2_1, updateCryptoPh2_1] = useState(cryptoPh2_1);
  const [cryptoPh2_2, updateCryptoPh2_2] = useState(cryptoPh2_2);
  const [cryptoPh2_3, updateCryptoPh2_3] = useState(cryptoPh2_3);

  const [arrayForCryptoPh1, updateArrayForCryptoPh1] = useState([]);
  const [arrayForCryptoPh2, updateArrayForCryptoPh2] = useState([]);
  const [error, setError] = useState('');

  function updateDefaultPh1EncryptionData() {
    if (hardwareSupport === true) {
      updateArrayForCryptoPh1(hardwarePh1Encryption);
    } else {
      updateArrayForCryptoPh1(softwareEncryption);
    }
  }

  function updateDefaultPh2EncryptionData() {
    if (hardwareSupport === true) {
      updateArrayForCryptoPh2(hardwarePh2Encryption);
    } else {
      updateArrayForCryptoPh2(softwareEncryption);
    }
  }

  useEffect(() => {
    updateDefaultPh1EncryptionData();
    updateDefaultPh2EncryptionData();
  }, [hardwarePh1Encryption, hardwarePh2Encryption, softwareEncryption, hardwareSupport]);

  const fetchVRFDetails = async () => {
    try {
      const data = await client(`${id}`);
      console.log(data);
      updateDetailVrf(data);
      updateVrfName(data.client_name);
      updateLanIpMask(data.lan_ip);
      updatePhysicalInterface(data.physical_interface);
      updateActive(data.active);
      updateHardwareSupport(data.hardware_support);
      updateVlanValue(data.vlan);
      updateBgpValue(data.local_as);
      updateCryptoPh1_1(data.crypto_ph1[0]);
      updateCryptoPh1_2(data.crypto_ph1[1]);
      updateCryptoPh1_3(data.crypto_ph1[2]);
      updateCryptoPh2_1(data.crypto_ph2[0]);
      updateCryptoPh2_2(data.crypto_ph2[1]);
      updateCryptoPh2_3(data.crypto_ph2[2]);
      updateLoading(false);
    } catch (err) {
      setError(err.error);
    }
    console.log(error);
  };

  useEffect(() => {
    fetchVRFDetails().then(() => {
      console.log('fetch complete');
    });
  }, [id]);

  if (loading === true) {
    return <Loader />;
  }

  const payload = {
    client_name: vrfName,
    lan_ip: lanIpMask,
    active: active,
    vlan: parseInt(vlanValue, 10),
    crypto_ph1: [cryptoPh1_1, cryptoPh1_2, cryptoPh1_3],
    crypto_ph2: [cryptoPh2_1, cryptoPh2_2, cryptoPh2_3],
    physical_interface: physicalInterface,
    hardware_support: hardwareSupport,
    local_as: parseInt(bgpValue, 10),
    endpoints: detailVrf.endpoints
  };

  const updateVrfConnection = async (e) => {
    e.preventDefault();
    try {
      await client(`${id}`, payload, '', { method: 'PUT' });
    } catch (err) {
      setError(err.error);
    }
    console.log(error);
  };

  const removeVrfConnection = async (e) => {
    e.preventDefault();
    try {
      await client(`${id}`, {}, '', { method: 'DELETE' });
      updateSidebar();
      history.push('create');
    } catch (err) {
      setError(err.error);
    }
    console.log(error);
  };

  function handleActiveChange() {
    updateActive(!active);
  }

  function handleHardwareSupportChange() {
    updateHardwareSupport(!hardwareSupport);

    if (hardwareSupport === true) {
      updateArrayForCryptoPh1(softwareEncryption);
      updateArrayForCryptoPh2(softwareEncryption);
    } else {
      updateArrayForCryptoPh1(hardwarePh1Encryption);
      updateArrayForCryptoPh2(hardwarePh2Encryption);
    }
  }

  return (
    <div>
      <div className="vrf-detail-container">
        <Breadcrumb vrfAddress={detailVrf.client_name} connectionType="VRFs" className="active-vrf" />
        <Button className="btn red-btn delete-btn" handleClick={removeVrfConnection} textValue="Delete VRF" />
        <br />
        <div className="vrf-detail-section-container">
          <div className="vrf-section-header">VRF Details</div>

          <form onSubmit={handleSubmit()}>
            <div className="vrf-column-1">
              <div className="vrf-column-1-item">
                <label htmlFor="client_name">Name:</label>
                <input type="text" name="client_name" /> <br />
                <label htmlFor="lan_ip">LAN IP/MASK:</label>
                <input type="text" name="lan_ip" /> <br />
                <label htmlFor="physical_interface">Physical interface:</label>
                <input type="text" placeholder="eth0" name="physical_interface" />
              </div>
              <div className="vrf-column-checkbox-item">
                <input type="checkbox" name="active" />
                <label htmlFor="active">Active</label>
                <input type="checkbox" name="hardware_support" />
                <label id="checkbox-label" htmlFor="hardware_support">
                  Hardware support
                </label>
              </div>
              <Button className="btn save-changes-btn" handleClick={updateVrfConnection} textValue="Save changes" />
            </div>
            <div className="vrf-column-2">
              <div className="vrf-column-item-number">
                <label htmlFor="local_as">BGP local AS</label>
                <input type="number" min="1" max={maxValueForLocalAS} name="local_as" step="1" />
              </div>
              <div className="vrf-column-item-number">
                <label htmlFor="vlan">VLAN</label>
                <input type="number" min="1" max={maxValueForVlan} name="vlan" step="1" />
              </div>
            </div>
            <div className="vrf-column-3">
              <CryptoHandler
                title="Crypto phase 1"
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
                title="Crypto phase 2"
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
        <div className="vrf-detail-section-container">
          <div className="vrf-section-header">Endpoints</div>
          <table className="endpoints-table">
            <thead>
              <EndpointTableHeader hardwareSupport={hardwareSupport} />
            </thead>
            <tbody>
              {detailVrf &&
                detailVrf.endpoints &&
                detailVrf.endpoints.map((endpoint) => {
                  return <EndpointTableRow endpoint={endpoint} key={uuidv4()} hardwareSupport={hardwareSupport} />;
                })}
              <NewEndpointRow hardwareSupport={hardwareSupport} />
            </tbody>
          </table>
        </div>
        <Dump {...detailVrf} />
      </div>
    </div>
  );
}
