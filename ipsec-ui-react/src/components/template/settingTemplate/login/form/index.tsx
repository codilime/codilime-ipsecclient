import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { newLoginSchema } from 'schema/';
import { Field } from 'template';
import { Button } from 'common/';
import { DynamicLoginForm } from 'db';

export const LoginForm: FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: yupResolver(newLoginSchema) });

  const submit = (data: any) => {
    console.log(data);
  };

  const displayForm = DynamicLoginForm.map((input) => <Field {...{ ...input, key: input.name, error: errors[input.name], setting: true, register: register(input.name), validate: false }} />);

  return (
    <form className="loginForm" onSubmit={handleSubmit(submit)}>
      <fieldset className="loginForm__fieldset">
        {displayForm}
        <div className="loginForm__submit">
          <Button className="loginForm__btn">Save changes</Button>
        </div>
      </fieldset>
    </form>
  );
};
