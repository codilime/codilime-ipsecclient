import React from 'react';

import PropTypes from 'prop-types';
import classNames from 'classnames';

export const Input = ({ type, name, placeholder, register}) => {
  return (
    <input
      className={classNames({input__checkbox: type === 'checkbox', input__number: type === 'number'}, 'field__input') }
      {...{ type, name, placeholder }} {...register}
    />
  );
};

Input.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  register: PropTypes.any
};
