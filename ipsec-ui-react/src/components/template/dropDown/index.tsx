import { FC, ReactNode } from 'react';
import { AiOutlineUser, AiOutlineSetting, AiOutlineUpload, AiOutlineRest } from 'react-icons/ai';
import { SettingOptionType } from 'interface/index';
import classNames from 'classnames';
import './styles.scss';

interface DropDownType {
  open?: boolean;
  handleToggle?: () => void;
  handleOpenSection: (name: SettingOptionType) => void;
}

interface DropDownListType {
  value: SettingOptionType;
  text: string;
  icon: ReactNode;
}

export const DropDown: FC<DropDownType> = ({ open, handleOpenSection, handleToggle }) => {
  const { profile, restConf, certificates, about } = SettingOptionType;
  const dropDownList: DropDownListType[] = [
    { value: profile, text: 'login', icon: <AiOutlineUser className="dropDown__icon" /> },
    { value: restConf, text: 'RestConf', icon: <AiOutlineSetting className="dropDown__icon" /> },
    { value: certificates, text: 'Certificates', icon: <AiOutlineUpload className="dropDown__icon" /> },
    { value: about, text: 'About', icon: <AiOutlineRest className="dropDown__icon" /> }
  ];

  const displayDropDownList = dropDownList.map(({ value, text, icon }) => (
    <li key={value} className="dropDown__item" onClick={() => handleOpenSection(value)}>
      {icon} {text}
    </li>
  ));

  return (
    <div className={classNames('dropDown', { dropDown__active: open })} onMouseLeave={handleToggle}>
      <ul className="dropDown__list">{displayDropDownList}</ul>
    </div>
  );
};
