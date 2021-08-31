import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './styles.scss';

export const Button = ({ children, onClick, className, btnDelete, disabled }) => (
  <button {...{ onClick, disabled }} className={classNames('button', { [className]: className, button__delete: btnDelete, button__disabled: disabled })}>
    {children}
  </button>
);

Button.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  className: PropTypes.string,
  btnDelete: PropTypes.bool,
  disabled: PropTypes.bool
};

export const EndpointButton = ({ onClick, secondary, children, disabled, className }) => (
  <button
    {...{ onClick, disabled }}
    className={classNames('endpointButton', {
      [className]: className,
      endpointButton__secondary: secondary,
      endpointButton__disabled: disabled
    })}
    disabled={disabled}
  >
    {children}
  </button>
);

EndpointButton.propTypes = {
  onClick: PropTypes.func,
  secondary: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
};
