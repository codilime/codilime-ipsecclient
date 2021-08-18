import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useGetLocation } from 'hooks';
import { validateDataInput } from 'utils/util.js';

export const Input = ({ type, name, placeholder, register }) => {
  const { currentLocation } = useGetLocation();
  const readOnly = currentLocation === '1' && name === 'client_name';
  return <input className={classNames('field__input', { input__checkbox: type === 'checkbox' })} {...{ type, name, placeholder, readOnly: readOnly }} onKeyPress={validateDataInput} {...register} />;
};

Input.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  register: PropTypes.any
};
