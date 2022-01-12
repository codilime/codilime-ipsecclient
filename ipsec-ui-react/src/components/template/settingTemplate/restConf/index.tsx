import { FC } from 'react';
import { RestConfForm } from './form';
import { Wrapper, HoverPanel } from 'template';
import { UseRestConfLogic } from 'hooks/';
import classNames from 'classnames';

interface RestConfType {
  open: boolean;
}

export const RestConf: FC<RestConfType> = ({ open }) => {
  const { handleSendRestConf, handleResetRestConf, active, description } = UseRestConfLogic(open);

  return (
    <>
      <Wrapper {...{ title: 'Cat 9300x Credentials', wrapperClass: classNames('loginForm__wrapper', { loginForm__disabled: active }) }}>
        <RestConfForm {...{ handleSendRestConf }} />
      </Wrapper>
      <HoverPanel
        {...{
          title: 'The variables are set.',
          description,
          button: 'Reset',
          active,
          handleReset: handleResetRestConf
        }}
      />
    </>
  );
};
