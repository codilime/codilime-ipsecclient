import { FC, ReactNode } from 'react';
import classNames from 'classnames';
import { AiOutlineSafetyCertificate, AiOutlineSetting, AiOutlineUser } from 'react-icons/ai';
import { SettingOptionType } from 'interface/index';
interface SettingOptionsType {
  activeSetting: keyof SettingOptionType;
  handleChangeActiveSetting: (name: keyof SettingOptionType) => void;
}

interface settingDataType {
  option: keyof SettingOptionType;
  text: string;
  icon: ReactNode;
}

const settingData: settingDataType[] = [
  {
    option: 'Profile',
    text: 'Profile',
    icon: <AiOutlineUser className="setting__icon" />
  },
  {
    option: 'RestConf',
    text: 'RestConf',
    icon: <AiOutlineSetting className="setting__icon" />
  },
  {
    option: 'Certificates',
    text: 'CA Certificates',
    icon: <AiOutlineSafetyCertificate className="setting__icon" />
  }
];

export const SettingOption: FC<SettingOptionsType> = ({ activeSetting, handleChangeActiveSetting }) => (
  <nav className="setting__nav">
    <ul className="setting__list">
      {settingData.map(({ text, icon, option }) => (
        <li key={text} className={classNames('setting__option', { setting__active: activeSetting === option })} onClick={() => handleChangeActiveSetting(option)}>
          {icon} <span>{text}</span>
        </li>
      ))}
    </ul>
  </nav>
);
