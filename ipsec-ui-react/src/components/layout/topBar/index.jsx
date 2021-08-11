import React from 'react';
import Logo from 'assets/cisco_logo.png';
import PropTypes from 'prop-types';
import './styles.scss';

export const TopBar = ({ productName }) => (
  <header className="topBar">
    <img src={Logo} alt="cisco logo" className="topBar__image" />
    <p className="topBar__productName">{productName}</p>
  </header>
);

TopBar.defaultProps = {
  productName: 'IPsec User Interface'
};
TopBar.propTypes = {
  productName: PropTypes.string
};
