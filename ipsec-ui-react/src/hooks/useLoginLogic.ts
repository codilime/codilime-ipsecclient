/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { useState, useEffect } from 'react';
import { client } from 'api/';
import { ChangePasswordType, DescriptionType } from 'interface/index';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { newLoginSchema } from 'schema/';

export const useLoginLogic = () => {
  const [logged, setLogged] = useState<boolean>(false);
  const [description, setDescription] = useState<DescriptionType>({ result: 'default', message: '' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ resolver: yupResolver(newLoginSchema) });

  const handleChangeGlobalPassword = async (data: ChangePasswordType) => {
    const status: boolean = await client('password', { password: data.password }, { method: 'POST' });
    if (status) {
      setLogged(true);
      setDescription({ result: 'success', message: 'Successful change. New variables saved' });
    } else {
      setLogged(true);
      setDescription({ result: 'error', message: 'Error change, something is wrong' });
    }
    setTimeout(() => {
      reset();
      window.location.reload();
      client('vrf', {}, { method: 'POST', headers: { Authorization: '' } });
    }, 500);
  };

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setDescription({ result: 'default', message: '' });
      setLogged(false);
    }, 2000);
    return () => {
      clearTimeout(timeOut);
    };
  }, [description]);

  const handleLogout = () => {
    window.location.reload();
    client('vrf', {}, { method: 'POST', headers: { Authorization: '' } });
  };

  return { description, logged, errors, register, handleSubmit, handleLogout, handleChangeGlobalPassword };
};
