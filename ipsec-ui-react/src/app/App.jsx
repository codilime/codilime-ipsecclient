import React, {useEffect} from 'react';
import {useState} from "react";
import {HashRouter as Router, Route, Switch} from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import DetailVRF from '../pages/DetailVRF';
import NewVRF from "../pages/NewVRF";
import './App.scss';
import axios from "axios";

export default function App() {
    const [VRFConnections, updateVRFConnections] = useState([]);
    const [softwareCryptoEncryption, updateSoftwareCryptoEncryption] = useState([]);
    const [hardwareCryptoPh1Encryption, updateHardwareCryptoPh1Encryption] = useState([]);
    const [hardwareCryptoPh2Encryption, updateHardwareCryptoPh2Encryption] = useState([]);


    async function fetchVRFsData() {
        const response = await axios.get('/api/vrfs');
        let data = response.data;
        if (Array.isArray(data)) {
            updateVRFConnections(data);
        }
    }

    async function fetchSoftwareEncryptionData() {
        const response = await axios.get('/api/algorithms/software');
        let data = response.data;
        if (data && Object.keys(data).length > 0) {
            updateSoftwareCryptoEncryption(data);
        }
    }

    async function fetchHardwareEncryptionPh1Data() {
        const response = await axios.get('api/algorithms/hardware/ph1');
        let data = response.data;
        if (data && Object.keys(data).length > 0) {
            updateHardwareCryptoPh1Encryption(data);
        }
    }

    async function fetchHardwareEncryptionPh2Data() {
        const response = await axios.get('api/algorithms/hardware/ph2');
        let data = response.data;
        if (data && Object.keys(data).length > 0) {
            updateHardwareCryptoPh2Encryption(data);
        }
    }


    useEffect(() => {
        fetchVRFsData();
        fetchSoftwareEncryptionData();
        fetchHardwareEncryptionPh1Data();
        fetchHardwareEncryptionPh2Data()
    }, []);

    return (
        <Router>
            <div className="app-container">
                <TopBar />
                <Sidebar VRFConnections={VRFConnections} />
                <div className="main-view-container">
                    <Switch>
                        <Route path="/vrf/create" render={routeProps =>
                            <div><NewVRF
                                routeProps={routeProps}
                                cryptoPhaseEncryption={softwareCryptoEncryption}
                                updateSidebar={fetchVRFsData}
                            /></div>}
                        />
                        <Route path="/vrf/:id" render={() => <div style={{ display: "flex" }}>
                            <DetailVRF
                                cryptoPhaseEncryption={softwareCryptoEncryption}
                                updateSidebar={fetchVRFsData}
                            /></div>}
                        />
                        <Route path="*" render={() => <div>No available data to display</div>} />
                    </Switch>
                </div>
            </div>
        </Router>
    )
}
