import { FC } from 'react';
import { useVrfLogic } from 'hooks/';
import { validateDataInput } from 'utils/';
import { InputType } from 'interface/components';
import classNames from 'classnames';

interface InputTypes extends InputType {
  register?: any;
  setting?: boolean;
  validate?: boolean;
  vlan?: boolean;
}

export const Input: FC<InputTypes> = ({ type, name, placeholder, register, setting, validate, vlan }) => {
  const { hardware } = useVrfLogic();
  const readOnly = hardware && name === 'client_name';
  const validated = validate ? validateDataInput : null;

  return (
    <input
      className={classNames('field__input', { input__checkbox: type === 'checkbox', field__input__setting: setting, field__vlan: vlan })}
      {...{ type, name, placeholder, readOnly, onKeyPress: validated, ...register }}
    />
  );
};
