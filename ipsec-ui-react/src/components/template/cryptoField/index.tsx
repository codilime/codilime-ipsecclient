import { FC } from 'react';
import { useAppContext, useCryptoLogic } from 'hooks/';
import { FieldValues, UseFormSetValue } from 'react-hook-form';
import './styles.scss';
import classNames from 'classnames';

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
        <select className="crypto__select" name="encryption" value={cryptoData.encryption} onChange={handleSetCryptoData}>
          {encryptionOption}
        </select>
        <select className="crypto__select" name="integrity" value={cryptoData.integrity} onChange={handleSetCryptoData}>
          {integrityOption}
        </select>
        <select className="crypto__select" name="keyExchange" value={cryptoData.keyExchange} onChange={handleSetCryptoData}>
          {keyExchangeOption}
        </select>
      </div>
      {error && <p className="field__error">{error.message}</p>}
    </>
  );
};
