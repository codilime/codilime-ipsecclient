import React from "react";

import {v4 as uuidv4} from "uuid";

export default function CryptoHandler(props) {

    const {
        arrayForCrypto1,
        valuePh1,
        valuePh2,
        valuePh3,
        updatePh1,
        updatePh2,
        updatePh3
    } = props;


    return (
        <div className="vrf-crypto-container">
            <label htmlFor="crypto_ph1">Crypto phase 1</label>
            <select
                id="crypto_ph1_1"
                name="crypto_ph1_1"
                onChange={(event) =>
                    updatePh1(event.target.value)
                }
                value={valuePh1}
            >
                {arrayForCrypto1 &&
                arrayForCrypto1.encryption &&
                arrayForCrypto1.encryption.map(
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
                    updatePh2(event.target.value)
                }
                value={valuePh2}
            >
                {arrayForCrypto1 &&
                arrayForCrypto1.integrity &&
                arrayForCrypto1.integrity.map(
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
                    updatePh3(event.target.value)
                }
                value={valuePh3}
            >
                {arrayForCrypto1 &&
                arrayForCrypto1.key_exchange &&
                arrayForCrypto1.key_exchange.map(
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
    )
}
