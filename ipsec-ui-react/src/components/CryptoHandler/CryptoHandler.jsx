import React from "react";

import { v4 as uuidv4 } from "uuid";

export default function CryptoHandler(props) {
    const {
        arrayForCrypto,
        valuePh1,
        valuePh2,
        valuePh3,
        updatePh1,
        updatePh2,
        updatePh3,
        cryptoStage
    } = props;

    return (
        <div className="vrf-crypto-container">
            <label htmlFor="crypto_ph1">{cryptoStage}</label>
            <select
                id="crypto_ph1_1"
                name="crypto_ph1_1"
                onChange={(event) => updatePh1(event.target.value)}
                value={valuePh1}
            >
                {arrayForCrypto &&
                arrayForCrypto.encryption &&
                arrayForCrypto.encryption.map((element) => {
                        return (
                            <option value={element} key={uuidv4()}>
                                {element}
                            </option>
                        );
                    })}
            </select>
            <select
                id="crypto_ph1_2"
                name="crypto_ph1_2"
                onChange={(event) => updatePh2(event.target.value)}
                value={valuePh2}
            >
                {arrayForCrypto &&
                arrayForCrypto.integrity &&
                arrayForCrypto.integrity.map((element) => {
                        return (
                            <option value={element} key={uuidv4()}>
                                {element}
                            </option>
                        );
                    })}
            </select>
            <select
                id="crypto_ph1_3"
                name="crypto_ph1_3"
                onChange={(event) => updatePh3(event.target.value)}
                value={valuePh3}
            >
                {arrayForCrypto &&
                arrayForCrypto.key_exchange &&
                arrayForCrypto.key_exchange.map((element) => {
                        return (
                            <option value={element} key={uuidv4()}>
                                {element}
                            </option>
                        );
                    })}
            </select>
        </div>
    );
}
