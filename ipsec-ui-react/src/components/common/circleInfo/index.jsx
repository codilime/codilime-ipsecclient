import React from 'react';
import PropTypes from 'prop-types';
import './styles.scss';

export const CircleInfo = ({ children }) => {
  return <span className="circle">{children}</span>;
};

CircleInfo.propTypes = {
  children: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};
