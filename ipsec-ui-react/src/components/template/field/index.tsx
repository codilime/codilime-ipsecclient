import React, { FC } from 'react';
import { Input } from 'common';
import classNames from 'classnames';
import './styles.scss';

interface FieldProps {
  type: string;
  name: string;
  placeholder: string;
  text: string;
  register: any;
  value: any;
  setting: boolean;
  error: { message: string; type: string; ref: any };
  validate: boolean;
  className: string;
}

export const Field: FC<FieldProps> = ({ text, type, name, placeholder, register, value, error, setting, validate = true, className }) => (
  <div
    className={classNames('field', {
      field__checkbox: type === 'checkbox',
      field__checkbox__active: name === 'active' && value,
      [className]: className
    })}
  >
    <label className={classNames('field__label', { field__label__checkbox: type === 'checkbox' })}>{text}</label>
    <Input {...{ type, value, name, placeholder, register, setting, validate }} />
    {error && <p className="field__error">{error.message}</p>}
  </div>
);
