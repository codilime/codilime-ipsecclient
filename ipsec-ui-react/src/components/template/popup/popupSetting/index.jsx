import React from 'react';
import PropTypes from 'prop-types';
import { Popup, SettingOption, SettingContent } from 'template';
import './styles.scss';

export const PopupSetting = ({ open, handleToggle, handleChangeActiveSetting, activeSetting }) => {
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
  handleChangeActiveSetting: PropTypes.func,
  activeSetting: PropTypes.shape({ profile: PropTypes.bool, restConf: PropTypes.bool, certificate: PropTypes.bool }),
  logs: PropTypes.array
};
