import React, { ChangeEvent, MouseEvent, FC, Ref } from 'react';
import { IoEyeSharp } from 'react-icons/io5';
import { BsEyeSlashFill } from 'react-icons/bs';
import { validateDataInput } from 'utils/util';
import { useToggle } from '_hooks';
import classNames from 'classnames';
import './styles.scss';

interface IEndpointInput {
  type: string;
  name: string;
  references: Ref<HTMLInputElement>;
  placeholder: string;
  value?: string | number;
  edit: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick?: (e: MouseEvent<HTMLInputElement>) => void;
  checked?: boolean;
  error?: any;
}

export const EndpointInput: FC<IEndpointInput> = ({ type, placeholder, name, value, edit, onChange, onClick, checked, error, references }) => {
  const { open, handleToggle } = useToggle();
  const icon = open && edit ? <BsEyeSlashFill className="endpointInput__icon" onClick={handleToggle} /> : <IoEyeSharp className="endpointInput__icon" onClick={handleToggle} />;

  const showEyes = type === 'password' && edit ? <>{icon}</> : null;

  return (
    <>
      <input
        className={classNames('endpointInput', {
          endpointInput__checkbox: type === 'checkbox',
          endpointInput__active: edit && type !== 'file',
          endpointInput__error: error && error[name],
          endpointInput__radio: type === 'radio',
          endpointInput__file: type === 'file'
        })}
        {...{ type: open && edit ? 'text' : type, name, placeholder, value, onChange, onClick, onKeyPress: validateDataInput, checked, disabled: !edit, ref: references }}
      />
      {showEyes}
    </>
  );
};
