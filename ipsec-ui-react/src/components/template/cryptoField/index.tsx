import React, { FC } from 'react';
import './styles.scss';

interface ICryptoField {
  name: string;
  text: string;
  register: any;
  value: string[];
  crypto: { encryption: string[]; integrity: string[]; key_exchange: string[] };
  error: { message: string; type: string; ref: any };
}

export const CryptoField: FC<ICryptoField> = ({ text, name, crypto = { encryption: [''], integrity: [''], key_exchange: [''] }, register, error }) => {
  const encryptionOption = crypto['encryption'].map((el) => (
    <option key={el} value={el}>
      {el}
    </option>
  ));
  const integrityOption = crypto['integrity'].map((el) => (
    <option key={el} value={el}>
      {el}
    </option>
  ));
  const keyExchangeOption = crypto['key_exchange'].map((el) => (
    <option key={el} value={el}>
      {el}
    </option>
  ));

  return (
    <>
      <div className="crypto" {...{ name }}>
        <label className="crypto__label">{text}</label>
        <select className="crypto__select" {...register(`${name}[0]`)}>
          {encryptionOption}
        </select>
        <select className="crypto__select" {...register(`${name}[1]`)}>
          {integrityOption}
        </select>
        <select className="crypto__select" {...register(`${name}[2]`)}>
          {keyExchangeOption}
        </select>
      </div>
      {error && <p className="field__error">{error.message}</p>}
    </>
  );
};
