import React, { useEffect, useState } from "react";

import { HashRouter as Router, Route, Switch } from "react-router-dom";
import axios from "axios";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import DetailVRF from "../pages/DetailVRF";
import NewVRF from "../pages/NewVRF";
import "./App.scss";

export default function App() {
    const [VRFConnections, updateVRFConnections] = useState([]);
    const [softwareEncryption, updateSoftwareEncryption] = useState([]);
    const [hardwarePh1Encryption, updateHardwarePh1Encryption] = useState([]);
    const [hardwarePh2Encryption, updateHardwarePh2Encryption] = useState([]);

    async function fetchVRFsData() {
        const response = await axios.get("/api/vrfs");
        let data = response.data;
        if (Array.isArray(data)) {
            updateVRFConnections(data);
        }
    }

    async function fetchSoftwareEncryptionData() {
        const response = await axios.get("/api/algorithms/software");
        let data = response.data;
        if (data && Object.keys(data).length > 0) {
            updateSoftwareEncryption(data);
        }
    }

    async function fetchHardwareEncryptionPh1Data() {
        const response = await axios.get("api/algorithms/hardware/ph1");
        let data = response.data;
        if (data && Object.keys(data).length > 0) {
            updateHardwarePh1Encryption(data);
        }
    }

    async function fetchHardwareEncryptionPh2Data() {
        const response = await axios.get("api/algorithms/hardware/ph2");
        let data = response.data;
        if (data && Object.keys(data).length > 0) {
            updateHardwarePh2Encryption(data);
        }
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
                <TopBar />
                <Sidebar VRFConnections={VRFConnections} />
                <div className="main-view-container">
                    <Switch>
                        <Route
                            path="/vrf/create"
                            render={(routeProps) => (
                                <NewVRF
                                    routeProps={routeProps}
                                    softwareEncryption={softwareEncryption}
                                    hardwarePh1Encryption={
                                        hardwarePh1Encryption
                                    }
                                    hardwarePh2Encryption={
                                        hardwarePh2Encryption
                                    }
                                    updateSidebar={fetchVRFsData}
                                />
                            )}
                        />
                        <Route
                            path="/vrf/:id"
                            render={() => (
                                <DetailVRF
                                    softwareEncryption={softwareEncryption}
                                    hardwarePh1Encryption={
                                        hardwarePh1Encryption
                                    }
                                    hardwarePh2Encryption={
                                        hardwarePh2Encryption
                                    }
                                    updateSidebar={fetchVRFsData}
                                />
                            )}
                        />
                        <Route
                            path="*"
                            render={() => (
                                <div>Please select VRF to view details</div>
                            )}
                        />
                    </Switch>
                </div>
            </div>
        </Router>
    );
}
