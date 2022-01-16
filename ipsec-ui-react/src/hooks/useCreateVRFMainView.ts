import { useEffect, useLayoutEffect } from 'react';
import { DynamicVrfHardwareDetails, DynamicVrfDetails } from 'db';
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
    console.log(data.vlan);
  }, [reset, currentLocation, data]);

  const submit = async (data: VrfDataTypes) => {
    console.log(data.vlan);
    // if (!data.vlan) data.vlan = [];
    // if (data.id) return patchVrfData({ vrf: data });
    // const res = await postVrfData({ vrf: data });
    // if (res) return history.push(`/vrf/${vrf.length + 1}`);
  };

  const crypto = hardware ? hardwareCrypto : softwareCrypto;

  const formAttributes = { crypto, details: DynamicVrfDetails, data, isValid, isDirty, setValue, register };

  return { errors, hardware, handleSubmit, submit, reset, formAttributes };
};
