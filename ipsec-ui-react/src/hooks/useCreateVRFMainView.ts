import { useEffect, useLayoutEffect } from 'react';
import { DynamicVrfDetails } from 'db';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { vrfSchema } from 'schema/';
import { useFetchData, useGetLocation, useAppContext } from 'hooks/';
import { VrfDataTypes } from 'interface/index';

export const useCreateVRFMainView = () => {
  const { context } = useAppContext();
  const { history, currentLocation } = useGetLocation();
  const { postVrfData, patchVrfData } = useFetchData();
  const { data, softwareCrypto, hardwareCrypto, hardware, vrf } = context;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    control,
    reset,
    setValue
  } = useForm<VrfDataTypes>({
    defaultValues: {
      endpoint: [],
      vlan: []
    },
    resolver: yupResolver(vrfSchema)
  });

  useLayoutEffect(() => {
    reset(data);
  }, [reset, currentLocation, data]);

  useEffect(() => {
    reset({ ...data, vlan: data.vlan });
  }, [reset, data, currentLocation]);

  const submit = async (data: VrfDataTypes) => {
    if (data.id) return patchVrfData({ vrf: data });
    const res = await postVrfData({ vrf: data });
    if (res) return history.push(`/vrf/${vrf.length + 1}`);
  };

  const crypto = hardware ? hardwareCrypto : softwareCrypto;

  const formAttributes = { crypto, details: DynamicVrfDetails, data, isValid, isDirty, setValue, register };

  return { errors, hardware, handleSubmit, submit, reset, formAttributes, control };
};
