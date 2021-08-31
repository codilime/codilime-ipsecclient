import React from 'react';
import Logo from 'images/cisco_logo.png';
import PropTypes from 'prop-types';
import { useLoginLogic, useSettingLogic } from 'hooks';
import { TopSideIcon, CircleInfo } from 'common';
import { PopupSetting } from 'template';
import { FiSettings, FiBell, FiLogOut } from 'react-icons/fi';
import './styles.scss';

export const TopBar = ({ productName }) => {
  const { handleLogout } = useLoginLogic();
  const { open, handleToggle } = useSettingLogic();
  return (
    <header className="topBar">
      <div className="topBar__right">
        <img src={Logo} alt="cisco logo" className="topBar__image" />
        <p className="topBar__productName">{productName}</p>
      </div>
      <div className="topBar__left">
        <TopSideIcon>
          <>
            <FiBell className="topBar__icon" />
            <CircleInfo>1</CircleInfo>
          </>
        </TopSideIcon>
        <TopSideIcon>
          <>
            <FiSettings className="topBar__icon" onClick={handleToggle} />
            <PopupSetting {...{ open, handleToggle, title: 'Settings' }} />
          </>
        </TopSideIcon>
        <TopSideIcon>
          <FiLogOut className="topBar__icon" onClick={handleLogout} />
        </TopSideIcon>
      </div>
    </header>
  );
};

TopBar.defaultProps = {
  productName: 'IPsec User Interface'
};

TopBar.propTypes = {
  productName: PropTypes.string
};
