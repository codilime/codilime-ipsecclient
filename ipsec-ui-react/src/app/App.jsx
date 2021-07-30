import React, { useEffect, useState } from "react";

import { HashRouter as Router, Route, Switch } from "react-router-dom";

import axios from "axios";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import DetailVRF from "../pages/DetailVRF";
import NewVRF from "../pages/NewVRF";
import "./App.scss";
import {isEmptyObject} from "../util";

export default function App() {
    const [VRFConnections, updateVRFConnections] = useState([]);
    const [softwareEncryption, updateSoftwareEncryption] = useState([]);
    const [hardwarePh1Encryption, updateHardwarePh1Encryption] = useState([]);
    const [hardwarePh2Encryption, updateHardwarePh2Encryption] = useState([]);

    async function fetchVRFsData() {
        await axios({
            method: "get",
            url: "/api/vrfs",
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

    async function fetchSoftwareEncryptionData() {
        await axios({
            method: "get",
            url: "/api/algorithms/software",
        }).then(
            (response) => {
                const data = response.data;
                if (data && Object.keys(data).length > 0)  {
                    updateSoftwareEncryption(data);
                }
            },
            (error) => {
                console.log(error);
            }
        );
    }

    async function fetchHardwareEncryptionPh1Data() {
        await axios({
            method: "get",
            url: "api/algorithms/hardware/ph1",
        }).then(
            (response) => {
                const data = response.data;
                if (data && Object.keys(data).length > 0)  {
                    updateHardwarePh1Encryption(data);
                }
            },
            (error) => {
                console.log(error);
            }
        );
    }

    async function fetchHardwareEncryptionPh2Data() {
        await axios({
            method: "get",
            url: "api/algorithms/hardware/ph2",
        }).then(
            (response) => {
                const data = response.data;
                if (data && Object.keys(data).length > 0)  {
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

    const maxValueForLocal_as = Math.pow(2, 32);

    return (
        <Router>
            <div className="app-container">
                <Topbar />
                <Sidebar VRFConnections={VRFConnections} />
                <div className="main-view-container">
                    <Switch>
                        <Route
                            path="/vrf/create"
                            render={(routeProps) => (
                                <NewVRF
                                    maxValueForLocal_as={maxValueForLocal_as}
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
                                    maxValueForLocal_as={maxValueForLocal_as}
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