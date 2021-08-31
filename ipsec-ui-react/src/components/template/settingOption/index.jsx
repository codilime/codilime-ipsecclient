import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export const SettingOption = ({ activeSetting, handleChangeActiveSetting }) => {
  return (
    <nav className="setting__nav">
      <ul className="setting__list">
        <li className={classNames('setting__option', { setting__active: activeSetting.profile })} onClick={() => handleChangeActiveSetting('profile')}>
          <span>Profile</span>
        </li>
        <li className={classNames('setting__option', { setting__active: activeSetting.certificate })} onClick={() => handleChangeActiveSetting('certificate')}>
          <span>Certificates</span>
        </li>
      </ul>
    </nav>
  );
};

SettingOption.propTypes = {
  activeSetting: PropTypes.shape({ login: PropTypes.bool, certificate: PropTypes.bool, kredki: PropTypes.bool }),
  handleChangeActiveSetting: PropTypes.func
};
