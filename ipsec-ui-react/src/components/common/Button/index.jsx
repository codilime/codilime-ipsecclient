import React from 'react';
import PropTypes from 'prop-types';
import './styles.scss';
export const Button = ({ children, onClick, className, btnDelete }) => (
  <button {...{ onClick }} className={`button ${className} ${btnDelete ? 'button__delete' : ''}`}>
    {children}
  </button>
);
Button.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  className: PropTypes.string,
  btnDelete: PropTypes.bool
};
export const EndpointButton = ({ onClick, secondary, children, disabled }) => (
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
EndpointButton.propTypes = {
  onClick: PropTypes.func,
  secondary: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
};
