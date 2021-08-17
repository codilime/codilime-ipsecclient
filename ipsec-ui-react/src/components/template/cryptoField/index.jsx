import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useFieldArray } from 'react-hook-form';
import './styles.scss';

export const CryptoField = ({ text, name, crypto, register, error }) => {
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
    <div>
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
    </div>
  );
};

CryptoField.defaultProps = {
  crypto: { encryption: [''], integrity: [''], key_exchange: [''] }
};

CryptoField.propTypes = {
  name: PropTypes.string,
  text: PropTypes.string,
  register: PropTypes.any,
  value: PropTypes.array,
  control: PropTypes.any,
  getValues: PropTypes.any,
  error: PropTypes.shape({ message: PropTypes.string, type: PropTypes.string, ref: PropTypes.any }),
  crypto: PropTypes.shape({ encryption: PropTypes.array, integrity: PropTypes.array, key_exchange: PropTypes.array })
};
