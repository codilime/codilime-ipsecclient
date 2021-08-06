import React from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import './style.scss';

import { useCreateVRFMainView } from '../../../_hooks/useCreateVRFMainView';

import { vrfSchema } from '../../../schema';
import { detailForm } from 'db/detailForm';

export function FormDetail() {
  const { VRFColumnOneView, VRFColumnTwoView, VRFColumnThreeView } = useCreateVRFMainView();
  const { register, handleSubmit, errors } = useForm({ resolver: yupResolver(vrfSchema) });
  console.log(detailForm);

  return (
    <form onSubmit={handleSubmit()} autoComplete='off' className='form'>
      <fieldset className='form__fieldset'>
        <div className='form__fieldset__column'>{VRFColumnOneView}</div>
        <div className='form__fieldset__column'>{VRFColumnTwoView}</div>
        <div className='form__fieldset__column'>{VRFColumnThreeView}</div>
      </fieldset>
    </form>
  );
}
