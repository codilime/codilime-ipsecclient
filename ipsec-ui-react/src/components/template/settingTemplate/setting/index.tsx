import { FC } from 'react';
import { TopSideIcon } from 'common/';
import { PopupSetting } from 'template';
import { FiSettings } from 'react-icons/fi';
import { useSettingLogic } from 'hooks/';

interface settingType {
  open: boolean;
  handleToggle: () => void;
}

export const Setting: FC<settingType> = ({ open, handleToggle }) => {
  const { handleChangeActiveSetting, activeSetting } = useSettingLogic();
  return (
    <TopSideIcon>
      <FiSettings className="topBar__icon" onClick={handleToggle} />
      <PopupSetting {...{ open, handleToggle, title: 'Settings', handleChangeActiveSetting, activeSetting }} />
    </TopSideIcon>
  );
};
