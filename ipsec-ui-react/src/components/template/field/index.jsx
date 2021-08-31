import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'common';
import classNames from 'classnames';
import './styles.scss';

export const Field = ({ text, type, name, placeholder, register, value, error, setting }) => {
  const style = classNames('field', {
    field__checkbox: type === 'checkbox',
    field__checkbox__active: name === 'active' && value,
    field__checkbox__hardware: name === 'hardware_support' && value
  });
  return (
    <div className={style}>
      <label className={classNames('field__label', { field__label__checkbox: type === 'checkbox' })}>{text}</label>
      <Input {...{ type, value, name, placeholder, register, setting }} />
      {error && <p className="field__error">{error.message}</p>}
    </div>
  );
};

Field.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  text: PropTypes.string,
  register: PropTypes.any,
  value: PropTypes.any,
  setting: PropTypes.bool,
  error: PropTypes.shape({ message: PropTypes.string, type: PropTypes.string, ref: PropTypes.any })
};
