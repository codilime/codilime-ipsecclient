import { useState, useEffect } from 'react';
import { client } from 'api/';
import { ChangePasswordType, descriptionType } from 'interface/index';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { newLoginSchema } from 'schema/';
export const useLoginLogic = () => {
  const [logged, setLogged] = useState<boolean>(false);
  const [description, setDescription] = useState<descriptionType>({ result: 'default', message: '' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ resolver: yupResolver(newLoginSchema) });

  const handleChangeGlobalPassword = async (data: ChangePasswordType) => {
    const { status } = await client('changepass', {}, { method: 'POST', body: data.newPassword });

    if (status === 'ok') {
      setLogged(true);
      setDescription({ result: 'success', message: 'Successful change. New variables saved' });
    }
    if (!status) {
      setLogged(true);
      setDescription({ result: 'error', message: 'Error change, something is wrong' });
    }
    setTimeout(() => {
      reset();
      client('vrfs', {}, { method: 'POST', headers: { Authorization: '' } });
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
 
    client('vrfs', {}, { method: 'POST', headers: { Authorization: '' } });
    window.location.reload();
  };

  return { description, logged, errors, register, handleSubmit, handleLogout, handleChangeGlobalPassword };
};
