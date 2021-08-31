import React from 'react';
import PropTypes from 'prop-types';
import { Popup, SettingOption, SettingContent } from 'template';
import { useSettingLogic } from 'hooks';
import './styles.scss';

export const PopupSetting = ({ open, handleToggle }) => {
  const { handleChangeActiveSetting, activeSetting } = useSettingLogic(open);
  return (
    <Popup {...{ open, handleToggle, title: 'Settings' }}>
      <section className="setting">
        <SettingOption {...{ handleChangeActiveSetting, activeSetting }} />
        <SettingContent {...{ activeSetting }} />
      </section>
    </Popup>
  );
};

PopupSetting.propTypes = {
  open: PropTypes.bool,
  handleToggle: PropTypes.func,
  logs: PropTypes.array
};
