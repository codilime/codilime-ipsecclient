import { FC } from 'react';
import { Popup, SettingOption, SettingContent } from 'template';
import { SettingOptionType } from 'interface/index';
import './styles.scss';

interface PopupSettingType {
  open: boolean;
  handleToggle: () => void;
  handleChangeActiveSetting: (name: keyof SettingOptionType) => void;
  activeSetting: keyof SettingOptionType;
}

export const PopupSetting: FC<PopupSettingType> = ({ open, handleToggle, handleChangeActiveSetting, activeSetting }) => {
  return (
    <Popup {...{ open, handleToggle, title: 'Settings' }}>
      <section className="setting">
        <SettingOption {...{ handleChangeActiveSetting, activeSetting }} />
        <SettingContent {...{ activeSetting, open, handleToggle }} />
      </section>
    </Popup>
  );
};
