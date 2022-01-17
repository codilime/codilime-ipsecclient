import { FC } from 'react';
import { Input } from 'common/';
import classNames from 'classnames';
import { InputType } from 'interface/components';
import './styles.scss';

interface FieldType extends InputType {
  text?: string;
  register?: any;
  error?: any;
  setting?: boolean;
  vlan?: boolean;
  validate?: boolean;
  className?: string;
}

export const Field: FC<FieldType> = ({ text, type, name, placeholder, register, onChange, value, error, setting, validate = true, vlan, className = '' }) => (
  <div
    className={classNames('field', {
      field__checkbox: type === 'checkbox',
      field__checkbox__active: name === 'active' && value,
      [className]: className
    })}
  >
    <label htmlFor={name} className={classNames('field__label', { field__label__checkbox: type === 'checkbox' })}>
      {text}
    </label>
    <Input {...{ type, name, placeholder, register, setting, validate, vlan, onChange }} />
    {error && <p className={classNames('field__error', { field__error__setting: setting })}>{error.message}</p>}
  </div>
);
