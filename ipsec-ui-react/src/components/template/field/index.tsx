import { FC } from 'react';
import { Input } from 'common/';
import classNames from 'classnames';
import { InputType } from 'interface/components';
import './styles.scss';

interface FieldType extends InputType {
  text?: string;
  register: any;
  error?: any;
  setting?: boolean;
  validate?: boolean;
  className?: string;
}

export const Field: FC<FieldType> = ({ text, type, name, placeholder, register, value, error, setting, validate = true, className = '' }) => (
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
