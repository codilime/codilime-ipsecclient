import { FC } from 'react';
import { HoverPanel } from 'template';
import { LoginForm } from './form';
import { useLoginLogic } from 'hooks/';
import './styles.scss';

interface LoginType {
  handleClose: () => void;
}

export const Login: FC<LoginType> = ({ handleClose }) => {
  const { description, logged: active, handleChangeGlobalPassword, errors, handleSubmit, register } = useLoginLogic();

  return (
    <div className="loginForm__wrapper">
      <h3 className="loginForm__title">UI/API change password</h3>
      <LoginForm {...{ handleChangeGlobalPassword, errors, handleSubmit, register, handleClose }} />
      <HoverPanel {...{ description, active }} />
    </div>
  );
};
