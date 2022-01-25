/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { SettingOptionType } from 'interface/index';
import { Popup, About } from 'template';

interface PopupAboutType {
  activeSetting: SettingOptionType | string;
  handleChangeActiveSetting: (name: SettingOptionType | string) => void;
}

export const PopupAbout: FC<PopupAboutType> = ({ activeSetting, handleChangeActiveSetting }) => (
  <Popup {...{ open: activeSetting === SettingOptionType.about, handleToggle: () => handleChangeActiveSetting(''), title: 'About' }}>
    <About />
  </Popup>
);
