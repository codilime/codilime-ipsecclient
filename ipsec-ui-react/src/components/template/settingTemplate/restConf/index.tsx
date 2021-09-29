import { FC } from 'react';
import { RestConfForm } from './form';
import { Wrapper, HoverPanel } from 'template';
import { useSettingLogic } from 'hooks/';

export const RestConf: FC = () => {
  const { handleSendRestConf, handleResetRestConf, logged, description } = useSettingLogic();

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
