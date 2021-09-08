import React, { FC } from 'react';
import './styles.scss';

interface ICryptoField {
  name: string;
  text: string;
  register: any;
  value: [];
  error: any;
  crypto: any;
}

export const CryptoField: FC<ICryptoField> = ({ text, name, crypto, register, error }) => {
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

CryptoField.defaultProps = {
  crypto: { encryption: [''], integrity: [''], key_exchange: [''] }
};

// CryptoField.propTypes = {
//   error: PropTypes.shape({ message: PropTypes.string, type: PropTypes.string, ref: PropTypes.any }),
//   crypto: PropTypes.shape({ encryption: PropTypes.array, integrity: PropTypes.array, key_exchange: PropTypes.array })
// };
