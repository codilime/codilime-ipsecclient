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
