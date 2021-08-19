import React, { useContext, useEffect, useState } from 'react';
import { DynamicVRFView } from 'db';
import { VrfsContext } from 'context';
import { Field, CryptoField } from 'template';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { vrfSchema } from 'schema';
import { useFetchData, useGetLocation } from 'hooks';

export const useCreateVRFMainView = () => {
  const { vrf } = useContext(VrfsContext);
  const { currentLocation } = useGetLocation();
  const { postVrfData, putVrfData } = useFetchData();
  const { mainVRFViewColumnOne, mainVRFViewColumnTwo, mainVRFViewColumnThree } = DynamicVRFView;
  const { data, softwareCrypto, hardwareCrypto, hardware } = vrf;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset
  } = useForm({ resolver: yupResolver(vrfSchema) });

  useEffect(() => {
    reset(data);
  }, [reset, data, currentLocation]);

  const submit = (data) => {
    if (data.id) {
      putVrfData(data);
    } else {
      postVrfData(data);
    }
  };
  
  const crypto = hardware ? hardwareCrypto : softwareCrypto;

  const VRFColumnOneView = mainVRFViewColumnOne.map((el) => <Field key={el.name} {...el} value={data[el.name]} register={register(el.name)} error={errors[el.name]} />);
  const VRFColumnTwoView = mainVRFViewColumnTwo.map((el) => <Field key={el.name} {...el} value={data[el.name]} register={register(el.name)} error={errors[el.name]} />);
  const VRFColumnThreeView = mainVRFViewColumnThree.map((el) => <CryptoField key={el.name} {...el} {...{ crypto: crypto[el.name], register }} error={errors[el.name]} />);

  return { VRFColumnOneView, VRFColumnTwoView, VRFColumnThreeView, isDirty, isValid, handleSubmit, submit };
};
