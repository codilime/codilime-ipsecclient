/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { TopSideIcon } from 'common/';
import { PopupAbout, PopupSetting, DropDown } from 'template';
import { useSettingLogic } from 'hooks/';

interface SettingType {
  open: boolean;
  handleToggle: () => void;
}

export const Setting: FC<SettingType> = ({ open, handleToggle }) => {
  const { handleChangeActiveSetting, activeSetting } = useSettingLogic();

  return (
    <TopSideIcon>
      <AiOutlineUser className="topBar__icon" onClick={handleToggle} />
      <DropDown {...{ open, handleToggle, handleOpenSection: handleChangeActiveSetting }} />
      <PopupAbout {...{ activeSetting, handleChangeActiveSetting }} />
      <PopupSetting {...{ handleToggle, title: 'Settings', handleChangeActiveSetting, activeSetting }} />
    </TopSideIcon>
  );
};
