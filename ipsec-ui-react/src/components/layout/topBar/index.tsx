/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { useState, FC } from 'react';
import { MdOutlineDarkMode, MdOutlineWbSunny } from 'react-icons/md';
import Switch from 'react-switch';
import { SecondaryButton } from 'common/';
import { Notification, Setting, PopupLogs } from 'template';
import { useThemeContext } from 'hooks/';
import { ThemeType, TopBarMenu } from 'interface/enum';
import './styles.scss';

export const TopBar: FC = () => {
  const { dark, light } = ThemeType;
  const { logs, notice, dropDown } = TopBarMenu;
  const { theme, setTheme } = useThemeContext();
  const [openPopup, setOpenPopup] = useState<TopBarMenu | null>(null);

  const handleOpenAction = (name: TopBarMenu) => {
    if (openPopup === null) return setOpenPopup(name);
    return setOpenPopup(null);
  };

  return (
    <header className="topBar">
      <div className="topBar__left">
        <div className="topBar__switch">
          <Switch
            checked={theme === 'light'}
            onChange={() => setTheme(theme === light ? dark : light)}
            onColor="#00abe7"
            offColor="#00abe7"
            handleDiameter={18}
            checkedIcon={<MdOutlineWbSunny className="topBar__modeIcon" />}
            uncheckedIcon={<MdOutlineDarkMode className="topBar__modeIcon" />}
            boxShadow="0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 1px 0px rgba(0, 0, 0, 0.14) "
            activeBoxShadow="0px 0px 1px 4px rgba(0, 0, 0, 0.2)"
            height={22}
            width={44}
          />
        </div>
        <SecondaryButton onClick={() => handleOpenAction(logs)}>View logs</SecondaryButton>
        <Notification {...{ open: openPopup === notice, handleToggle: () => handleOpenAction(notice) }} />
        <Setting {...{ open: openPopup === dropDown, handleToggle: () => handleOpenAction(dropDown) }} />
        <PopupLogs {...{ open: openPopup === logs, handleToggle: () => handleOpenAction(logs) }} />
      </div>
    </header>
  );
};
