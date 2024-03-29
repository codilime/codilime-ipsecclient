/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC, ReactNode } from 'react';
import { AiOutlineSafetyCertificate, AiOutlineSetting, AiOutlineUser } from 'react-icons/ai';
import { SettingOptionType } from 'interface/index';
import classNames from 'classnames';
interface SettingOptionsType {
  activeSetting: SettingOptionType | string;
  handleChangeActiveSetting: (name: SettingOptionType) => void;
}

interface settingDataType {
  value: SettingOptionType;
  text: string;
  icon: ReactNode;
}

const settingData: settingDataType[] = [
  {
    value: SettingOptionType.profile,
    text: 'Profile',
    icon: <AiOutlineUser className="setting__icon" />
  },
  {
    value: SettingOptionType.restConf,
    text: 'RestConf',
    icon: <AiOutlineSetting className="setting__icon" />
  },
  {
    value: SettingOptionType.certificates,
    text: 'CA Certificates',
    icon: <AiOutlineSafetyCertificate className="setting__icon" />
  }
];

export const SettingOption: FC<SettingOptionsType> = ({ activeSetting, handleChangeActiveSetting }) => (
  <nav className="setting__nav">
    <ul className="setting__list">
      {settingData.map(({ text, icon, value }) => (
        <li key={text} className={classNames('setting__option', { setting__active: activeSetting === value })} onClick={() => handleChangeActiveSetting(value)}>
          {icon} <span>{text}</span>
        </li>
      ))}
    </ul>
  </nav>
);
