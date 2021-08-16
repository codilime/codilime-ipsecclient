import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { validateDataInput } from 'utils/util.js';

export const Input = ({ type, name, placeholder, register }) => (
  <input className={classNames({ field__input: true, input__checkbox: type === 'checkbox' })} {...{ type, name, placeholder }} onKeyPress={validateDataInput} {...register} />
);

Input.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  register: PropTypes.any
};
