import { FC } from 'react';
import { Wrapper, HoverPanel } from 'template';
import { LoginForm } from './form';
import { useLoginLogic } from 'hooks/';
import './styles.scss';

export const Login: FC = () => {
  const { description, logged, handleChangeGlobalPassword, errors, handleSubmit, register } = useLoginLogic();

  return (
    <Wrapper {...{ title: 'UI/API change password', className: 'loginForm__wrapper' }}>
      <LoginForm {...{ handleChangeGlobalPassword, errors, handleSubmit, register }} />
      <HoverPanel
        {...{
          description,
          active: logged
        }}
      />
    </Wrapper>
  );
  
};
