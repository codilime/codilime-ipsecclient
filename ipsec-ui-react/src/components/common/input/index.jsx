import React from 'react';
import PropTypes from 'prop-types';

export const Input = ({ type, name, placeholder, register }) => {
  return <input className="field__input" {...{ type, name, placeholder }} {...register} />;
};

Input.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  register: PropTypes.any
};
