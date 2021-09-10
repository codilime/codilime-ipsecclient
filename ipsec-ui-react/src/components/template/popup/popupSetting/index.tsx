import React, { FC } from 'react';

import { Popup, SettingOption, SettingContent } from 'template';
import { NotificationTypeProps } from '../../../../interface/components';

import './styles.scss';

interface PopupSettingProps extends NotificationTypeProps {
  handleChangeActiveSetting: () => void;
  activeSetting: { profile: boolean; restConf: boolean; certificate: boolean };
  logs: string[];
}

export const PopupSetting: FC<PopupSettingProps> = ({ open, handleToggle, handleChangeActiveSetting, activeSetting }) => {
  return (
    <Popup {...{ open, handleToggle, title: 'Settings' }}>
      <section className="setting">
        <SettingOption {...{ handleChangeActiveSetting, activeSetting }} />
        <SettingContent {...{ activeSetting }} />
      </section>
    </Popup>
  );
};
