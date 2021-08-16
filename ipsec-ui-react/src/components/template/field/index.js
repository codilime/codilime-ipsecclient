import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'common';
import './styles.scss';

export const Field = ({ text, type, name, placeholder, register, value, error }) => (
    <div className="field">
      <label className="field__label">{text}</label>
      <Input {...{ type, value, name, placeholder, register }} />
      {error && <p className="field__error">{error.message}</p>}
    </div>
);

Field.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  text: PropTypes.string,
  register: PropTypes.any,
  value: PropTypes.any,
  error: PropTypes.shape({ message: PropTypes.string, type: PropTypes.string, ref: PropTypes.any })
};
