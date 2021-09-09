import React from 'react';
import PropTypes from 'prop-types';
import './styles.scss';

export const TopSideIcon = ({ children }) => <div className="action__box">{children}</div>;

TopSideIcon.propTypes = {
  children: PropTypes.element
};
