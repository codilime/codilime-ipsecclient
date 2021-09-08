import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useVrfLogic } from 'hooks';
import { validateDataInput } from 'utils/util.js';

export const Input = ({ type, name, placeholder, register, setting, validate }) => {
  const { hardware } = useVrfLogic();
  const readOnly = hardware && name === 'client_name';
  const validated = validate ? validateDataInput : null;
  return (
    <input
      className={classNames('field__input', { input__checkbox: type === 'checkbox', field__input__setting: setting })}
      {...{ type, name, placeholder, readOnly, onKeyPress: validated, ...register }}
    />
  );
};

Input.propTypes = {
  type: PropTypes.string,
  setting: PropTypes.bool,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  register: PropTypes.any,
  validate: PropTypes.bool
};
