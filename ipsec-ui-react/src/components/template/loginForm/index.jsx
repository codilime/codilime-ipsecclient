import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { newLoginSchema } from 'schema';
import { Wrapper, Field } from 'template';
import { Button } from 'common';
import { DynamicLoginForm } from 'db';
import './styles.scss';

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: yupResolver(newLoginSchema) });

  const displayForm = DynamicLoginForm.map((input) => <Field {...{ ...input, key: input.name, error: errors[input.name], setting: true, register }} />);

  return (
    <Wrapper {...{ title: 'Change global password' }}>
      <form className="loginForm" onSubmit={handleSubmit}>
        <fieldset className="loginForm__fieldset">
          {displayForm}
          <div className="loginForm__submit">
            <Button className="loginForm__btn">Save changes</Button>
          </div>
        </fieldset>
      </form>
    </Wrapper>
  );
};