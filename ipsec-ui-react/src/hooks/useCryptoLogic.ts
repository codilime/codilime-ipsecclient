import { useState, useEffect, ChangeEvent } from 'react';
import { FieldValues, UseFormSetValue } from 'react-hook-form';

interface CryptoDateType {
  encryption: string;
  integrity: string;
  keyExchange: string;
}

export const useCryptoLogic = (name: string, value: string, setValue: UseFormSetValue<FieldValues>) => {
  const [cryptoData, setCryptoData] = useState<CryptoDateType>({ encryption: '', integrity: '', keyExchange: '' });

  const handleSetCryptoData = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCryptoData((prev) => ({ ...prev, [name]: value }));
  };

  const setCrypto = () => {
    const crypto = value.split('.');
    setCryptoData({ encryption: crypto[0], integrity: crypto[1] || '', keyExchange: crypto[2] || '' });
  };

  useEffect(() => {
    setCrypto();
  }, [value]);

  const setNewValue = () => {
    const { encryption, integrity, keyExchange } = cryptoData;
    const cryptoValue = `${encryption}.${integrity}.${keyExchange}`;
    if (value !== cryptoValue) setValue(`${name}`, cryptoValue, { shouldDirty: true });
  };

  useEffect(() => {
    setNewValue();
  }, [cryptoData]);

  return { handleSetCryptoData, cryptoData };
};
