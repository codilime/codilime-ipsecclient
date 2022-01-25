/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC, ReactNode } from 'react';
import { Login, RestConf, SettingCertificates } from 'template';
import { SettingOptionType } from 'interface/index';
import classNames from 'classnames';
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
