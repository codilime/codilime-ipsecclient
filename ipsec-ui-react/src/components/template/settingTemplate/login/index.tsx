import { FC } from 'react';
import { Wrapper, HoverPanel } from 'template';
import { LoginForm } from './form';
import { useLoginLogic } from 'hooks/';
import './styles.scss';

interface LoginType {
  handleToggle: () => void;
}

export const Login: FC<LoginType> = ({ handleToggle }) => {
  const { description, logged: active, handleChangeGlobalPassword, errors, handleSubmit, register } = useLoginLogic();

  return (
    <Wrapper {...{ title: 'UI/API change password', wrapperClass: 'loginForm__wrapper' }}>
      <LoginForm {...{ handleChangeGlobalPassword, errors, handleSubmit, register, handleToggle }} />
      <HoverPanel {...{ description, active }} />
    </Wrapper>
  );
};
