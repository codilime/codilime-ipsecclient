import React from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { useCreateVRFMainView } from '../../../_hooks/useCreateVRFMainView';
import { Wrapper } from '../wrapper';

import { vrfSchema } from '../../../schema';

import { Button } from '../../common';

import './style.scss';

export function FormDetail() {
  const { VRFColumnOneView, VRFColumnTwoView, VRFColumnThreeView } = useCreateVRFMainView();
  const { handleSubmit } = useForm({ resolver: yupResolver(vrfSchema) });

  return (
    <Wrapper title="VRF details">
      <form onSubmit={handleSubmit()} autoComplete="off" className="form">
        <fieldset className="form__fieldset">
          <div className="form__column">{VRFColumnOneView}</div>
          <div className="form__column">{VRFColumnTwoView}</div>
          <div className="form__column">{VRFColumnThreeView}</div>
        </fieldset>
        <Button endpointButton className="form__btn">
          Save changes
        </Button>
      </form>
    </Wrapper>
  );
}
