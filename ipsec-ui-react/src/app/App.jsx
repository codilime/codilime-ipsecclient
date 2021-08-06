import React, { useEffect, useState } from 'react';

import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import axios from 'axios';

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import DetailVRF from '../components/pages/DetailVRF/DetailVRF';
import NewVRF from '../components/pages/NewVRF/NewVRF';
import DefaultView from '../components/pages/DefaultView/DefaultView';
import './App.scss';
import '../css/Global.scss';
import {client} from "../_api";

export default function App() {
  const [VRFConnections, updateVRFConnections] = useState([]);
  const [softwareEncryption, updateSoftwareEncryption] = useState([]);
  const [hardwarePh1Encryption, updateHardwarePh1Encryption] = useState([]);
  const [hardwarePh2Encryption, updateHardwarePh2Encryption] = useState([]);

  function fetchVRFsData() {
    axios({
      method: 'get',
      url: '/api/vrfs'
    }).then(
      (response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          updateVRFConnections(data);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  function fetchSoftwareEncryptionData() {
    axios({
      method: 'get',
      url: '/api/algorithms/software'
    }).then(
      (response) => {
        const data = response.data;
        if (data && Object.keys(data).length > 0) {
          updateSoftwareEncryption(data);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // const fetchSoftwareEncryptionData = async () =>

  // const fetchVRFDetails = async () => {
  //   try {
  //     const data = await client(`${id}`);
  //     console.log(data);
  //     updateDetailVrf(data);
  //     updateVrfName(data.client_name);
  //     updateLanIpMask(data.lan_ip);
  //     updatePhysicalInterface(data.physical_interface);
  //     updateActive(data.active);
  //     updateHardwareSupport(data.hardware_support);
  //     updateVlanValue(data.vlan);
  //     updateBgpValue(data.local_as);
  //     updateCryptoPh1_1(data.crypto_ph1[0]);
  //     updateCryptoPh1_2(data.crypto_ph1[1]);
  //     updateCryptoPh1_3(data.crypto_ph1[2]);
  //     updateCryptoPh2_1(data.crypto_ph2[0]);
  //     updateCryptoPh2_2(data.crypto_ph2[1]);
  //     updateCryptoPh2_3(data.crypto_ph2[2]);
  //     updateLoading(false);
  //   } catch (err) {
  //     setError(err.error);
  //   }
  //   console.log(error);
  // };
  async function fetchHardwareEncryptionPh1Data() {
    axios({
      method: 'get',
      url: 'api/algorithms/hardware/ph1'
    }).then(
      (response) => {
        const data = response.data;
        if (data && Object.keys(data).length > 0) {
          updateHardwarePh1Encryption(data);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  function fetchHardwareEncryptionPh2Data() {
    axios({
      method: 'get',
      url: 'api/algorithms/hardware/ph2'
    }).then(
      (response) => {
        const data = response.data;
        if (data && Object.keys(data).length > 0) {
          updateHardwarePh2Encryption(data);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  useEffect(() => {
    fetchVRFsData();
    fetchSoftwareEncryptionData();
    fetchHardwareEncryptionPh1Data();
    fetchHardwareEncryptionPh2Data();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Topbar />
        <Sidebar VRFConnections={VRFConnections} />
        <div className="main-view-container">
          <Switch>
            <Route
              exact
              path="/vrf/create"
              render={() => (
                <NewVRF softwareEncryption={softwareEncryption} hardwarePh1Encryption={hardwarePh1Encryption} hardwarePh2Encryption={hardwarePh2Encryption} updateSidebar={fetchVRFsData} />
              )}
            />
            <Route
              path="/vrf/:id"
              render={() => (
                <DetailVRF softwareEncryption={softwareEncryption} hardwarePh1Encryption={hardwarePh1Encryption} hardwarePh2Encryption={hardwarePh2Encryption} updateSidebar={fetchVRFsData} />
              )}
            />
            <Route path="*" render={() => <DefaultView />} />
          </Switch>
        </div>
      </div>
    </Router>
  );
}
