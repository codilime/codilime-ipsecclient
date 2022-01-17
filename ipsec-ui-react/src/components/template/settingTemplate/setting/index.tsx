import { FC } from 'react';
import { TopSideIcon } from 'common/';
import { PopupSetting } from 'template';
import { AiOutlineUser } from 'react-icons/ai';
import { useSettingLogic } from 'hooks/';

interface SettingType {
  open: boolean;
  handleToggle: () => void;
}

export const Setting: FC<SettingType> = ({ open, handleToggle }) => {
  const { handleChangeActiveSetting, activeSetting } = useSettingLogic(open);

  return (
    <TopSideIcon>
      <AiOutlineUser className="topBar__icon" onClick={handleToggle} />
      <PopupSetting {...{ open, handleToggle, title: 'Settings', handleChangeActiveSetting, activeSetting }} />
    </TopSideIcon>
  );
};
