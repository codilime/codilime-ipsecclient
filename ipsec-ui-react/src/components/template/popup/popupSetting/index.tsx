/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC, useState, useEffect } from 'react';
import { Popup, SettingOption, SettingContent } from 'template';
import { SettingOptionType } from 'interface/index';
import './styles.scss';

interface PopupSettingType {
  handleChangeActiveSetting: (name: SettingOptionType | string) => void;
  activeSetting: SettingOptionType | string;
}

export const PopupSetting: FC<PopupSettingType> = ({ activeSetting, handleChangeActiveSetting }) => {
  const { profile, restConf, certificates } = SettingOptionType;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (activeSetting === restConf || activeSetting === profile || activeSetting == certificates) setOpen(true);
  }, [activeSetting]);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      handleChangeActiveSetting('');
    }, 300);
  };

  return (
    <Popup {...{ open, handleToggle: handleClose, title: 'Settings' }}>
      <section className="setting">
        <SettingOption {...{ handleChangeActiveSetting, activeSetting }} />
        <SettingContent {...{ activeSetting, open, handleClose }} />
      </section>
    </Popup>
  );
};
