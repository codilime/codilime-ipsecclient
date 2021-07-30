import React, {useEffect, useState} from "react";

import axios from "axios";

import Dump from "../../utils/Dump";
import {v4 as uuidv4} from "uuid";

export default function CryptoHandler() {

    const hardwareSupport = false;

    const [cryptoPh1_1, updateCryptoPh1_1] = useState(cryptoPh1_1);
    const [cryptoPh1_2, updateCryptoPh1_2] = useState(cryptoPh1_2);
    const [cryptoPh1_3, updateCryptoPh1_3] = useState(cryptoPh1_3);
    const [cryptoPh2_1, updateCryptoPh2_1] = useState(cryptoPh2_1);
    const [cryptoPh2_2, updateCryptoPh2_2] = useState(cryptoPh2_2);
    const [cryptoPh2_3, updateCryptoPh2_3] = useState(cryptoPh2_3);

    const [arrayForCryptoPh1, updateArrayForCryptoPh1] = useState([]);
    const [arrayForCryptoPh2, updateArrayForCryptoPh2] = useState([]);

    const [softwareEncryption, updateSoftwareEncryption] = useState([]);
    const [hardwarePh1Encryption, updateHardwarePh1Encryption] = useState([]);
    const [hardwarePh2Encryption, updateHardwarePh2Encryption] = useState([]);

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
        fetchSoftwareEncryptionData();
        fetchHardwareEncryptionPh1Data();
        fetchHardwareEncryptionPh2Data();
    }, []);

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
    }, [
        hardwarePh1Encryption,
        hardwarePh2Encryption,
        softwareEncryption,
    ]);

    return (
        <div>
            <div className="vrf-column-3">
                <div className="vrf-crypto-container">
                    <label htmlFor="crypto_ph1">Crypto phase 1</label>
                    <select
                        id="crypto_ph1_1"
                        name="crypto_ph1_1"
                        onChange={(event) =>
                            updateCryptoPh1_1(event.target.value)
                        }
                        value={cryptoPh1_1}
                    >
                        {arrayForCryptoPh1 &&
                        arrayForCryptoPh1.encryption &&
                        arrayForCryptoPh1.encryption.map(
                            (element) => {
                                return (
                                    <option
                                        value={element}
                                        key={uuidv4()}
                                    >
                                        {element}
                                    </option>
                                );
                            }
                        )}
                    </select>
                    <select
                        id="crypto_ph1_2"
                        name="crypto_ph1_2"
                        onChange={(event) =>
                            updateCryptoPh1_2(event.target.value)
                        }
                        value={cryptoPh1_2}
                    >
                        {arrayForCryptoPh1 &&
                        arrayForCryptoPh1.integrity &&
                        arrayForCryptoPh1.integrity.map(
                            (element) => {
                                return (
                                    <option
                                        value={element}
                                        key={uuidv4()}
                                    >
                                        {element}
                                    </option>
                                );
                            }
                        )}
                    </select>
                    <select
                        id="crypto_ph1_3"
                        name="crypto_ph1_3"
                        onChange={(event) =>
                            updateCryptoPh1_3(event.target.value)
                        }
                        value={cryptoPh1_3}
                    >
                        {arrayForCryptoPh1 &&
                        arrayForCryptoPh1.key_exchange &&
                        arrayForCryptoPh1.key_exchange.map(
                            (element) => {
                                return (
                                    <option
                                        value={element}
                                        key={uuidv4()}
                                    >
                                        {element}
                                    </option>
                                );
                            }
                        )}
                    </select>
                </div>
                <div className="vrf-crypto-container">
                    <label htmlFor="crypto_ph2">Crypto phase 2</label>
                    <select
                        id="crypto_ph2_1"
                        name="crypto_ph2_1"
                        onChange={(event) =>
                            updateCryptoPh2_1(event.target.value)
                        }
                        value={cryptoPh2_1}
                    >
                        {arrayForCryptoPh2 &&
                        arrayForCryptoPh2.encryption &&
                        arrayForCryptoPh2.encryption.map(
                            (element) => {
                                return (
                                    <option
                                        value={element}
                                        key={uuidv4()}
                                    >
                                        {element}
                                    </option>
                                );
                            }
                        )}
                    </select>
                    <select
                        id="crypto_ph2_2"
                        name="crypto_ph2_2"
                        onChange={(event) =>
                            updateCryptoPh2_2(event.target.value)
                        }
                        value={cryptoPh2_2}
                    >
                        {arrayForCryptoPh2 &&
                        arrayForCryptoPh2.integrity &&
                        arrayForCryptoPh2.integrity.map(
                            (element) => {
                                return (
                                    <option
                                        value={element}
                                        key={uuidv4()}
                                    >
                                        {element}
                                    </option>
                                );
                            }
                        )}
                    </select>
                    <select
                        id="crypto_ph2_3"
                        name="crypto_ph2_3"
                        onChange={(event) =>
                            updateCryptoPh2_3(event.target.value)
                        }
                        value={cryptoPh2_3}
                    >
                        {arrayForCryptoPh2 &&
                        arrayForCryptoPh2.key_exchange &&
                        arrayForCryptoPh2.key_exchange.map(
                            (element) => {
                                return (
                                    <option
                                        value={element}
                                        key={uuidv4()}
                                    >
                                        {element}
                                    </option>
                                );
                            }
                        )}
                    </select>
                </div>
            </div>
            <Dump value={softwareEncryption} />
            <Dump value={hardwarePh1Encryption} />
            <Dump value={hardwarePh2Encryption} />
        </div>
    )
}
