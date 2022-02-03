/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC, useEffect, useLayoutEffect } from 'react';
import { Field } from 'template';
import { Button } from 'common/';
import { DynamicRestConfForm } from 'db';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { restConfSchema } from 'schema/';
import { RestConfType } from 'interface/index';
import { useAppContext } from 'hooks/';

interface RestConfFormType {
  handleSendRestConf: (data: RestConfType) => void;
  handleClose: () => void;
  active: boolean;
}

export const RestConfForm: FC<RestConfFormType> = ({ handleSendRestConf, handleClose, active }) => {
  const {
    context: { restConf }
  } = useAppContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ resolver: yupResolver(restConfSchema) });

  useEffect(() => {
    if (active) reset(restConf);
  }, [active]);

  useLayoutEffect(() => {
    reset(restConf);
  }, [restConf]);

  const displayForm = DynamicRestConfForm.map((input) => (
    <Field {...{ ...input, key: input.name, error: errors[input.name], setting: true, register: register(input.name), validate: false, className: 'loginForm__restConf' }} />
  ));

  return (
    <>
      <form className="loginForm">
        <fieldset className="loginForm__fieldset">{displayForm}</fieldset>
      </form>
      <div className="loginForm__submit">
        <Button className="loginForm__cancel" onClick={handleClose}>
          cancel
        </Button>
        <Button className="loginForm__btn" onClick={handleSubmit(handleSendRestConf)}>
          Save changes
        </Button>
      </div>
    </>
  );
};
