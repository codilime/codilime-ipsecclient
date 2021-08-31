import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { restConfSchema } from 'schema';
import { Wrapper, Field } from 'template';
import { Button } from 'common';
import { DynamicRestConfForm } from 'db';

export const RestConfForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: yupResolver(restConfSchema) });

  const displayForm = DynamicRestConfForm.map((input) => <Field {...{ ...input, key: input.name, error: errors[input.name], setting: true, register }} />);
  return (
    <Wrapper {...{ title: 'Restconf credentials' }}>
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
