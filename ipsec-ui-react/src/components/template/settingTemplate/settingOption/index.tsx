import React, { FC } from 'react';
import classNames from 'classnames';

interface ISettingOption {
  activeSetting: { login: boolean; certificate: boolean; kredki: boolean; profile: boolean; restConf: boolean };
  handleChangeActiveSetting: () => void;
}

export const SettingOption: FC<ISettingOption> = ({ activeSetting, handleChangeActiveSetting }) => {
  return (
    <nav className="setting__nav">
      <ul className="setting__list">
        <li className={classNames('setting__option', { setting__active: activeSetting.profile })} onClick={() => handleChangeActiveSetting('profile')}>
          <span>Profile</span>
        </li>
        <li className={classNames('setting__option', { setting__active: activeSetting.restConf })} onClick={() => handleChangeActiveSetting('restConf')}>
          <span>RestConf</span>
        </li>
        <li className={classNames('setting__option', { setting__active: activeSetting.certificate })} onClick={() => handleChangeActiveSetting('certificate')}>
          <span>Certificates</span>
        </li>
      </ul>
    </nav>
  );
};