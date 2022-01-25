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
