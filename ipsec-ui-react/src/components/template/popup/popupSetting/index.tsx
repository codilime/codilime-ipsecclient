import { FC } from 'react';
import PropTypes from 'prop-types';
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
        <SettingContent {...{ activeSetting }} />
      </section>
    </Popup>
  );
};
