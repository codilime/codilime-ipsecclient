import React from 'react';

import PropTypes from 'prop-types';

import { Input } from 'common';
import './style.scss';

export const Field = ({ text, type, name, placeholder, references, onChange, value }) => {
  return (
    <div className="field" >
      <label className="field__label">{text}</label>
      <Input {...{ type, value, name, placeholder, onChange, ...references }} />
    </div>
  );
};

Field.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  text: PropTypes.string,
  references: PropTypes.any
};
