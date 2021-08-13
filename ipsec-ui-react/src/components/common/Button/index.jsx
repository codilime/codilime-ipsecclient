import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './styles.scss';

export const Button = ({ children, onClick, className, btnDelete }) => (
  <button {...{ onClick }} className={classNames({ button: true, [className]: className, button__delete: btnDelete })}>
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
    className={classNames({
      endpointButton: true,
      endpointButton__secondary: secondary,
      endpointButton__disable: disabled
    })}
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
