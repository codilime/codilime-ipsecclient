import { FC } from 'react';
import { Popup, SettingOption, SettingContent } from 'template';
import './styles.scss';

interface PopupSettingType {
  open: boolean;
  handleToggle: () => void;
  handleChangeActiveSetting: (name: string) => void;
  activeSetting: { profile: boolean; restConf: boolean; certificate: boolean };
}

export const PopupSetting: FC<PopupSettingType> = ({ open, handleToggle, handleChangeActiveSetting, activeSetting }) => {
  return (
    <Popup {...{ open, handleToggle, title: 'Settings' }}>
      <section className="setting">
        <SettingOption {...{ handleChangeActiveSetting, activeSetting }} />
        <SettingContent {...{ activeSetting, open }} />
      </section>
    </Popup>
  );
};
