import { FC } from 'react';
import './styles.scss';

interface CryptoFieldType {
  name: string;
  crypto: { encryption: string[]; integrity: string[]; key_exchange: string[] };
  register: any;
  error: any;
  text?: string;
}

export const CryptoField: FC<CryptoFieldType> = ({ text, name, crypto, register, error }) => {
  
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
