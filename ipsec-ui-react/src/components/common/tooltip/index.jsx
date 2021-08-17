import React from 'react';
import PropTypes from 'prop-types';
import './styles.scss';

export const ToolTip = ({ children }) => (
  <div className="tooltip">
    <div className="tooltip__arrow"></div>
    <div className="tooltip__label">{children}</div>
  </div>
);

ToolTip.propTypes = {
  children: PropTypes.string
};
