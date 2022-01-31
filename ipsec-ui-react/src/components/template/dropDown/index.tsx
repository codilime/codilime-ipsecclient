/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import React, { FC } from 'react';
import { AiOutlineUser, AiOutlineSetting, AiOutlineUpload, AiOutlineRest } from 'react-icons/ai';
import { DropDownListType, SettingOptionType } from 'interface/index';
import classNames from 'classnames';
import './styles.scss';

interface DropDownType {
  open?: boolean;
  handleToggle?: () => void;
  handleOpenSection: (name: SettingOptionType) => void;
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
    <React.Fragment key={value}>
      {value === about && <li className="dropDown__about"></li>}
      <li className={classNames('dropDown__item')} onClick={() => handleOpenSection(value)}>
        {icon} {text}
      </li>
    </React.Fragment>
  ));

  return (
    <div className={classNames('dropDown', { dropDown__active: open })} onMouseLeave={handleToggle}>
      <ul className="dropDown__list">{displayDropDownList}</ul>
    </div>
  );
};
