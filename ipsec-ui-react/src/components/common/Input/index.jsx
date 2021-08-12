import React from 'react';

import PropTypes from 'prop-types';
import classNames from 'classnames';

export const Input = ({ type, name, placeholder, onChange, ref, value }) => {
  return (
    <input
      className={classNames({ input__checkbox: type === 'checkbox', input__number: type === 'number', field__input: true })}
      value={value}
      type={type}
      name={name}
      placeholder={placeholder}
      onChange={onChange}
      ref={ref}
    />
  );
};

Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.any,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.instanceOf(Element) })])
};
