import { FC } from 'react';
import { Field } from 'template';
import { Button } from 'common/';
import { DynamicLoginForm } from 'db';
import { ChangePasswordType } from 'interface/index';
import { DeepMap, FieldErrors, FieldValues, UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';

interface LoginFormType {
  handleChangeGlobalPassword: (data: ChangePasswordType) => Promise<void>;
  errors: DeepMap<FieldValues, FieldErrors>;
  register: UseFormRegister<FieldValues>;
  handleSubmit: UseFormHandleSubmit<FieldValues>;
}

export const LoginForm: FC<LoginFormType> = ({ handleChangeGlobalPassword, errors, register, handleSubmit }) => {
  const displayForm = DynamicLoginForm.map((input) => (
    <Field {...{ ...input, key: input.name, error: errors[input.name], setting: true, register: register(input.name), validate: false, className: 'loginForm__field' }} />
  ));

  return (
    <form className="loginForm" onSubmit={handleSubmit(handleChangeGlobalPassword)}>
      <fieldset className="loginForm__fieldset">
        {displayForm}
        <div className="loginForm__submit">
          <Button className="loginForm__cancel">cancel</Button>
          <Button className="loginForm__btn">change</Button>
        </div>
      </fieldset>
    </form>
  );
};
