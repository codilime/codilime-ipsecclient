import React, { useContext, useEffect } from 'react';
import { DynamicVRFView } from 'db';
import { VrfsContext } from 'context';
import { Field } from 'template';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { vrfSchema } from 'schema';
import { useFetchData, useGetLocation } from 'hooks';

export const useCreateVRFMainView = () => {
  const {
    vrf: { data }
  } = useContext(VrfsContext);
  const { currentLocation } = useGetLocation();
  const { postVrfData, putVrfData } = useFetchData();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ resolver: yupResolver(vrfSchema) });

  useEffect(() => {
    reset(data);
  }, [reset, data, currentLocation]);

  const submit = (data) => {
    if (data.id) {
      putVrfData(data.id, data);
    } else {
      postVrfData(data);
    }
  };

  const { mainVRFViewColumnOne, mainVRFViewColumnTwo, mainVRFViewColumnThree } = DynamicVRFView;

  const VRFColumnOneView = mainVRFViewColumnOne.map((el) => <Field key={el.name} {...el} value={data[el.name]} register={register(el.name)} error={errors[el.name]} />);
  const VRFColumnTwoView = mainVRFViewColumnTwo.map((el) => <Field key={el.name} {...el} value={data[el.name]} register={register(el.name)} error={errors[el.name]} />);
  const VRFColumnThreeView = mainVRFViewColumnThree.map((el) => <Field key={el.name} {...el} value={data[el.name]} register={register(el.name)} error={errors[el.name]} />);

  return { VRFColumnOneView, VRFColumnTwoView, VRFColumnThreeView, handleSubmit, submit };
};
