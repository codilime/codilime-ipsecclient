import React, { FC } from 'react';
import classNames from 'classnames';
import { useVrfLogic } from 'hooks';
import { validateDataInput } from 'utils/util.js';

interface IInput {
  type?: string;
  name: string;
  placeholder?: string;
  register?: any;
  setting?: boolean;
  validate?: boolean;
}

export const Input: FC<IInput> = ({ type, name, placeholder, register, setting, validate }) => {
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
