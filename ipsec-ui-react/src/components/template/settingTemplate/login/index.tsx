import { FC } from 'react';
import { Wrapper } from 'template';
import { LoginForm } from './form';
import './styles.scss';

export const Login: FC = () => {
  return (
    <Wrapper {...{ title: 'UI/API change password', className: 'loginForm__wrapper' }}>
      <LoginForm />
    </Wrapper>
  );
};
