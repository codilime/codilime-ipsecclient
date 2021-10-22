import { useEffect } from 'react';
import { DynamicVrfHardwareDetails, DynamicVrfDetails } from 'db';
import { Field, CryptoField } from 'template';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFieldArray, useForm } from 'react-hook-form';
import { vrfSchema } from 'schema/';
import { useFetchData, useGetLocation, useAppContext } from 'hooks/';
import { vrfDataTypes } from 'interface/index';

export const useCreateVRFMainView = () => {
  const { context } = useAppContext();
  const { history, currentLocation } = useGetLocation();
  const { postVrfData, patchVrfData } = useFetchData();
  const { data, softwareCrypto, hardwareCrypto, hardware, vrf } = context;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    setValue
  } = useForm<vrfDataTypes>({
    resolver: yupResolver(vrfSchema)
  });

  useEffect(() => {
    reset(data);
  }, [reset, currentLocation, data]);

  const submit = async (data: vrfDataTypes) => {
    if (data.id) return patchVrfData({ vrf: data });
    const res = await postVrfData({ vrf: { ...data, id: vrf.length + 1 } });
    if (res) return history.push(`/vrf/${vrf.length + 1}`);
  };

  const crypto = hardware ? hardwareCrypto : softwareCrypto;
  const details = hardware ? DynamicVrfHardwareDetails : DynamicVrfDetails;

  const displayDetails = details.map((el) => {
    if (el.name === 'crypto_ph1' || el.name === 'crypto_ph2') {
      return <CryptoField {...{ ...el, key: el.name, crypto: crypto[el.name], setValue, value: data[el.name], error: errors[el.name] }} />;
    }
    return <Field {...{ ...el, key: el.name, value: data[el.name], register: register(el.name), error: errors[el.name], className: 'field__detail' }} />;
  });

  return { isDirty, isValid, errors, hardware, displayDetails, handleSubmit, submit, setValue, reset };
};
