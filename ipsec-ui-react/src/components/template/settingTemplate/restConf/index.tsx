import { FC } from 'react';
import { RestConfForm } from './form';
import { Wrapper, HoverPanel } from 'template';
import { UseRestConfLogic } from 'hooks/';

interface restConfType {
  open: boolean;
}

export const RestConf: FC<restConfType> = ({ open }) => {
  const { handleSendRestConf, handleResetRestConf, logged, description } = UseRestConfLogic(open);

  return (
    <Wrapper {...{ title: 'Cat 9300x Credentials', className: 'loginForm__wrapper' }}>
      <RestConfForm {...{ handleSendRestConf }} />
      <HoverPanel
        {...{
          description,
          button: 'Reset',
          active: logged,
          handleReset: handleResetRestConf
        }}
      />
    </Wrapper>
  );
};
