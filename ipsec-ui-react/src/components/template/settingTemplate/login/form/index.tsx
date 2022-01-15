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
  handleToggle: () => void;
}

export const LoginForm: FC<LoginFormType> = ({ handleChangeGlobalPassword, errors, register, handleSubmit, handleToggle }) => {
  const displayForm = DynamicLoginForm.map((input) => (
    <Field {...{ ...input, key: input.name, error: errors[input.name], setting: true, register: register(input.name), validate: false, className: 'loginForm__field' }} />
  ));

  return (
    <>
      <form className="loginForm">
        <fieldset className="loginForm__fieldset">{displayForm}</fieldset>
      </form>
      <div className="loginForm__submit">
        <Button className="loginForm__cancel" onClick={handleToggle}>
          Cancel
        </Button>
        <Button className="loginForm__btn" onClick={handleSubmit(handleChangeGlobalPassword)}>
          change
        </Button>
      </div>
    </>
  );
};
