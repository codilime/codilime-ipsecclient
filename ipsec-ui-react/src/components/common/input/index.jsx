import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useVrfLogic } from 'hooks';

import { validateDataInput } from 'utils/util.js';

export const Input = ({ type, name, placeholder, register }) => {
  const { hardware } = useVrfLogic();
  const readOnly = hardware && name === 'client_name';
  return <input className={classNames('field__input', { input__checkbox: type === 'checkbox' })} {...{ type, name, placeholder, readOnly }} onKeyPress={validateDataInput} {...register} />;
};

Input.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  register: PropTypes.any
};
