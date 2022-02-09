/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { useAppContext, useCryptoLogic } from 'hooks/';
import { UseFormSetValue } from 'react-hook-form';
import classNames from 'classnames';

import './styles.scss';
interface CryptoType {
  encryption: string[];
  integrity: string[];
  key_exchange: string[];
}

interface CryptoFieldType {
  name: string;
  crypto: CryptoType;
  setValue: UseFormSetValue<any>;
  error: any;
  text?: string;
  value: string;
}

export const CryptoField: FC<CryptoFieldType> = ({ text, name, crypto, error, value, setValue }) => {
  const { handleSetCryptoData, cryptoData } = useCryptoLogic(name, value, setValue);
  const {
    context: { hardware }
  } = useAppContext();

  const encryptionOption = crypto.encryption.map((el) => (
    <option key={el} value={el}>
      {el}
    </option>
  ));
  const integrityOption = crypto.integrity.map((el) => (
    <option key={el} value={el}>
      {el}
    </option>
  ));
  const keyExchangeOption = crypto.key_exchange.map((el) => (
    <option key={el} value={el}>
      {el}
    </option>
  ));

  return (
    <>
      <div className={classNames('crypto', { crypto__hardware: hardware })} {...{ name }}>
        <label className="crypto__label">{text}</label>
        <select
          className={classNames('crypto__select', { crypto__empty: !crypto.encryption.length })}
          disabled={!crypto.encryption.length}
          name="encryption"
          value={cryptoData.encryption}
          onChange={handleSetCryptoData}
        >
          {encryptionOption}
        </select>
        <select
          className={classNames('crypto__select', { crypto__empty: !crypto.integrity.length })}
          disabled={!crypto.integrity.length}
          name="integrity"
          value={cryptoData.integrity}
          onChange={handleSetCryptoData}
        >
          {integrityOption}
        </select>
        <select
          className={classNames('crypto__select', { crypto__empty: !crypto.key_exchange.length })}
          disabled={!crypto.key_exchange.length}
          name="keyExchange"
          value={cryptoData.keyExchange}
          onChange={handleSetCryptoData}
        >
          {keyExchangeOption}
        </select>
      </div>
      {error && <p className="field__error">{error.message}</p>}
    </>
  );
};
