import React from 'react';
import { TopSideIcon } from 'common';
import { PopupSetting } from 'template';
import { FiSettings } from 'react-icons/fi';
import { useSettingLogic } from 'hooks';

export const Setting = ({ open, handleToggle }) => {
  const { handleChangeActiveSetting, activeSetting } = useSettingLogic(open);
  return (
    <TopSideIcon>
      <>
        <FiSettings className="topBar__icon" onClick={handleToggle} />
        <PopupSetting {...{ open, handleToggle, title: 'Settings', handleChangeActiveSetting, activeSetting }} />
      </>
    </TopSideIcon>
  );
};
