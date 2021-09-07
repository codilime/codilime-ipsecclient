import React, { useContext, useEffect } from 'react';
import { DynamicVrfHardwareDetails, DynamicVrfDetails } from 'db';
import { VrfsContext } from 'context';
import { Field, CryptoField } from 'template';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { vrfSchema } from 'schema';
import { useFetchData, useGetLocation } from 'hooks';

export const useCreateVRFMainView = () => {
  const { vrf } = useContext(VrfsContext);
  const { history, currentLocation } = useGetLocation();
  const { postVrfData, putVrfData } = useFetchData();
  const { data, softwareCrypto, hardwareCrypto, hardware } = vrf;
  const { endpoints } = data;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    watch,
    setValue
  } = useForm({ resolver: yupResolver(vrfSchema) });

  useEffect(() => {
    if (endpoints === null) reset(data);
    else if (!endpoints.lenght) reset({ ...data, endpoints: null });
  }, [reset, currentLocation, data]);

  const submit = async (data, e) => {
    e.preventDefault();
    if (data.id) {
      return await putVrfData(data);
    }
    const id = await postVrfData(data);
    if (id) {
      history.push(`/vrf/${id}`);
    }
  };

  const crypto = hardware ? hardwareCrypto : softwareCrypto;
  const details = hardware ? DynamicVrfHardwareDetails : DynamicVrfDetails;

  const displayDetails = details.map((el) => {
    if (el.name === 'crypto_ph1' || el.name === 'crypto_ph2') {
      return <CryptoField {...{ ...el, key: el.name, crypto: crypto[el.name], register, value: data[el.name], error: errors[el.name] }} />;
    }
    return <Field {...{ ...el, key: el.name, value: data[el.name], register: register(el.name), error: errors[el.name], className: 'field__detail' }} />;
  });

  return { isDirty, isValid, hardware, displayDetails, handleSubmit, submit, setValue };
};
