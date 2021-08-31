import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useVrfLogic } from 'hooks';
import { validateDataInput } from 'utils/util.js';

export const Input = ({ type, name, placeholder, register, setting }) => {
  const { hardware } = useVrfLogic();
  const readOnly = hardware && name === 'client_name';

  return (
    <input
      className={classNames('field__input', { input__checkbox: type === 'checkbox', field__input__setting: setting })}
      {...{ type, name, placeholder, readOnly, onKeyPress: validateDataInput, ...register }}
    />
  );
};

Input.propTypes = {
  type: PropTypes.string,
  setting: PropTypes.bool,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  register: PropTypes.any
};
