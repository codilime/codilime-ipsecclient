import { FC, ReactNode } from 'react';
import { Login, RestConf, SettingCertificates } from 'template';
import classNames from 'classnames';
import { SettingOptionType } from 'interface/index';

interface SettingContentType {
  activeSetting: SettingOptionType | string;
  open: boolean;
  handleClose: () => void;
}

interface settingDataType {
  option: SettingOptionType;
  component: ReactNode;
}

export const SettingContent: FC<SettingContentType> = ({ activeSetting, open, handleClose }) => {
  const { profile, restConf, certificates } = SettingOptionType;
  const settingData: settingDataType[] = [
    {
      option: profile,
      component: <Login {...{ handleClose }} />
    },
    {
      option: restConf,
      component: <RestConf {...{ open, handleClose }} />
    },
    {
      option: certificates,
      component: <SettingCertificates {...{ handleClose }} />
    }
  ];

  return (
    <>
      {settingData.map(({ option, component }) => (
        <article key={option} className={classNames('setting__content', { setting__content__active: activeSetting === option })}>
          {component}
        </article>
      ))}
    </>
  );
};
