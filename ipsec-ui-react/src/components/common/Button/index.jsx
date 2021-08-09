import React from 'react';
import PropTypes from 'prop-types';
import './styles.scss';

export const Button = ({ children, onClick }) => {
  return <button {...{ onClick }}>{children}</button>;
};

Button.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.element
};

export const EndpointButton = ({ onClick, secondary, children, disabled }) => {
  return (
    <button
      {...{ onClick, disabled }}
      className={`endpointButton 
            ${secondary ? 'endpointButton__secondary' : ''}
            ${disabled ? 'endpointButton__disable' : ''}
            `}
    >
      {children}
    </button>
  );
};

EndpointButton.propTypes = {
  onClick: PropTypes.func,
  secondary: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
};
