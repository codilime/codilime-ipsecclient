import { FC, ReactNode } from 'react';
import { Login, RestConf, SettingCertificates } from 'template';
import classNames from 'classnames';
import { SettingOptionType } from 'interface/index';

interface SettingContentType {
  activeSetting: keyof SettingOptionType;
  open: boolean;
}

interface settingDataType {
  option: keyof SettingOptionType;
  component: ReactNode;
}

export const SettingContent: FC<SettingContentType> = ({ activeSetting, open }) => {
  const settingData: settingDataType[] = [
    {
      option: 'Profile',
      component: <Login />
    },
    {
      option: 'RestConf',
      component: <RestConf {...{ open }} />
    },
    {
      option: 'Certificates',
      component: <SettingCertificates />
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
