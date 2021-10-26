import { useLayoutEffect } from 'react';
import { DynamicVrfHardwareDetails, DynamicVrfDetails } from 'db';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
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

  useLayoutEffect(() => {
    reset(data);
  }, [reset, currentLocation, data]);

  const submit = async (data: vrfDataTypes) => {
    if (data.id) return patchVrfData({ vrf: data });
    const res = await postVrfData({ vrf: data });
    if (res) return history.push(`/vrf/${vrf.length + 1}`);
  };

  const crypto = hardware ? hardwareCrypto : softwareCrypto;
  const details = hardware ? DynamicVrfHardwareDetails : DynamicVrfDetails;

  const formAttributes = { crypto, details, data, isValid, isDirty, setValue, register };

  return { errors, hardware, handleSubmit, submit, reset, formAttributes };
};
