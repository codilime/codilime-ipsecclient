import React, { FC } from 'react';

import { Popup, SettingOption, SettingContent } from 'template';
import './styles.scss';

interface IPopupSetting {
  open: boolean;
  handleToggle: () => void;
  handleChangeActiveSetting: () => void;
  activeSetting: { profile: boolean; restConf: boolean; certificate: boolean };
  logs: string[];
}

export const PopupSetting: FC<IPopupSetting> = ({ open, handleToggle, handleChangeActiveSetting, activeSetting }) => {
  return (
    <Popup {...{ open, handleToggle, title: 'Settings' }}>
      <section className="setting">
        <SettingOption {...{ handleChangeActiveSetting, activeSetting }} />
        <SettingContent {...{ activeSetting }} />
      </section>
    </Popup>
  );
};
