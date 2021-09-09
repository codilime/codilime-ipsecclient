import React, { useState } from 'react';
import Logo from 'images/cisco_logo.png';
import PropTypes from 'prop-types';
import { Notification, Logout, Setting } from 'template';
import './styles.scss';

export const TopBar = ({ productName }) => {
  const [openPopup, setOpenPopup] = useState({ setting: false, notice: false });

  const handleOpenAction = (name) => {
    if (name === 'setting') {
      return setOpenPopup((prev) => ({ setting: !prev.setting, notice: false }));
    }
    return setOpenPopup((prev) => ({ notice: !prev.notice, setting: false }));
  };

  return (
    <header className="topBar">
      <div className="topBar__right">
        <img src={Logo} alt="cisco logo" className="topBar__image" />
        <p className="topBar__productName">{productName}</p>
      </div>
      <div className="topBar__left">
        <Notification {...{ open: openPopup.notice, handleToggle: handleOpenAction }} />
        <Setting {...{ open: openPopup.setting, handleToggle: () => handleOpenAction('setting') }} />
        <Logout />
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
