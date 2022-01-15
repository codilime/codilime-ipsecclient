import { FC, ReactNode } from 'react';
import { Login, RestConf, SettingCertificates } from 'template';
import classNames from 'classnames';
import { SettingOptionType } from 'interface/index';

interface SettingContentType {
  activeSetting: keyof SettingOptionType;
  open: boolean;
  handleToggle: () => void;
}

interface settingDataType {
  option: keyof SettingOptionType;
  component: ReactNode;
}

export const SettingContent: FC<SettingContentType> = ({ activeSetting, open, handleToggle }) => {
  const settingData: settingDataType[] = [
    {
      option: 'Profile',
      component: <Login {...{ handleToggle }} />
    },
    {
      option: 'RestConf',
      component: <RestConf {...{ open, handleToggle }} />
    },
    {
      option: 'Certificates',
      component: <SettingCertificates {...{ handleToggle }} />
    }
  ];

  return (
    <>
      {settingData.map(({ option, component }) => (
        <article className={classNames('setting__content', { setting__content__active: activeSetting === option })}>{component}</article>
      ))}
    </>
  );
};
