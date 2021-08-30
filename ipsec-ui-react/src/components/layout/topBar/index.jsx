import React from 'react';
import Logo from 'images/cisco_logo.png';
import PropTypes from 'prop-types';
import { useLoginLogic } from 'hooks';
import { TopSideIcon } from 'common';
import { FiSettings, FiBell, FiLogOut } from 'react-icons/fi';
import './styles.scss';

export const TopBar = ({ productName }) => {
  const { handleLogout } = useLoginLogic();
  return (
    <header className="topBar">
      <div className="topBar__right">
        <img src={Logo} alt="cisco logo" className="topBar__image" />
        <p className="topBar__productName">{productName}</p>
      </div>
      <div className="topBar__left">
        <TopSideIcon>
          <FiBell className="topBar__icon" />
        </TopSideIcon>
        <TopSideIcon>
          <FiSettings className="topBar__icon" />
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
