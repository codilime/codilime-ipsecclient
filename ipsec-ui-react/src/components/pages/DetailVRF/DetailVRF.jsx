import React, { useState, useEffect } from 'react';

import { useHistory, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { v4 as uuidv4 } from 'uuid';

import './DetailVRF.scss';
import '../NewVRF/NewVRF.scss';

import { FormDetail } from '../../template';
import { useCreateVRFMainView } from '../../../_hooks/useCreateVRFMainView';
import EndpointTableRow from '../../EndpointTableRow/EndpointTableRow';
import NewEndpointRow from '../../NewEndpointRow/NewEndpointRow';
import CryptoHandler from '../../CryptoHandler/CryptoHandler';
import EndpointTableHeader from '../../EndpointTableHeader/EndpointTableHeader';
import { Button } from 'common';
import Breadcrumb from '../../Breadcrumb/Breadcrumb';

import Dump from '../../../utils/Dump';
import Loader from '../../Loader/Loader';
// import { forceNumberClamp } from '../../utils/formatters';
import { client } from '../../../_api';
import { vrfSchema } from '../../../schema';
import { detailForm } from '../../../db/detailForm';

export function DetailViewVrf(props) {
  const { id } = useParams();
  const history = useHistory();
  const { register, handleSubmit, errors } = useForm({ resolver: yupResolver(vrfSchema) });
  const { VRFColumnOneView, VRFColumnTwoView, VRFColumnThreeView } = useCreateVRFMainView();

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
          <FormDetail />
        </div>
        <Dump {...detailVrf} />
      </div>
    </div>
  );
}
