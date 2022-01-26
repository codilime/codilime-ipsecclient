/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { useEffect, useLayoutEffect } from 'react';
import { DynamicVrfDetails, DynamicVrfHardwareDetails } from 'db';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { hardwareSchame, vrfSchema } from 'schema/';
import { useFetchData, useGetLocation, useAppContext } from 'hooks/';
import { VrfDataTypes } from 'interface/index';

export const useCreateVRFMainView = () => {
  const { context } = useAppContext();
  const { history, currentLocation } = useGetLocation();
  const { postVrfData, patchVrfData } = useFetchData();
  const { data, softwareCrypto, hardwareCrypto, hardware, vrf } = context;

  const schema = hardware ? hardwareSchame : vrfSchema;
  const details = hardware ? DynamicVrfHardwareDetails : DynamicVrfDetails;
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
    resolver: yupResolver(schema)
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

  const formAttributes = { crypto, details, data, isValid, isDirty, setValue, register };

  return { errors, hardware, handleSubmit, submit, reset, formAttributes, control };
};
