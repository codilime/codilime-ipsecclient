import { FC, useMemo } from 'react';
import { DeepMap, FieldErrors, FieldValues, UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';
import { Field } from 'template';
import { Button } from 'common/';
import { DynamicLoginForm } from 'db';
import { ChangePasswordType } from 'interface/index';

interface LoginFormType {
  handleChangeGlobalPassword: (data: ChangePasswordType) => Promise<void>;
  errors: DeepMap<FieldValues, FieldErrors>;
  register: UseFormRegister<FieldValues>;
  handleSubmit: UseFormHandleSubmit<FieldValues>;
  handleClose: () => void;
}

export const LoginForm: FC<LoginFormType> = ({ handleChangeGlobalPassword, errors, register, handleSubmit, handleClose }) => {
  const displayForm = useMemo(() => {
    return DynamicLoginForm.map((input) => (
      <Field {...{ ...input, key: input.name, error: errors[input.name], setting: true, register: register(input.name), validate: false, className: 'loginForm__field' }} />
    ));
  }, [DynamicLoginForm]);

  return (
    <>
      <form className="loginForm">
        <fieldset className="loginForm__fieldset">{displayForm}</fieldset>
      </form>
      <div className="loginForm__submit">
        <Button className="loginForm__cancel" onClick={handleClose}>
          Cancel
        </Button>
        <Button className="loginForm__btn" onClick={handleSubmit(handleChangeGlobalPassword)}>
          change
        </Button>
      </div>
    </>
  );
};
