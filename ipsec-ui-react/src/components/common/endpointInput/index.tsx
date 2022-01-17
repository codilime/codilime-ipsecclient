import { FC } from 'react';
import { IoEyeSharp } from 'react-icons/io5';
import { BsEyeSlashFill } from 'react-icons/bs';
import { validateDataInput } from 'utils/';
import { useToggle } from 'hooks/';
import { InputType } from 'interface/components';
import classNames from 'classnames';
import './styles.scss';

type ErrorProps = {
  remote_ip_se: boolean;
  psk: boolean;
  local_ip: boolean;
  peer_ip: boolean;
};

interface EndpointInputTypes extends InputType {
  edit?: boolean;
  error?: keyof ErrorProps | any;
  hardware?: boolean;
  onlyNumber?: boolean;
}

export const EndpointInput: FC<EndpointInputTypes> = ({ type, placeholder, name, value, edit, onChange, onClick, checked, error, references, hardware, onlyNumber }) => {
  const { open, handleToggle } = useToggle();

  const icon =
    open && edit ? (
      <BsEyeSlashFill className={classNames('endpointInput__icon', { endpointInput__icon__hardware: hardware })} onClick={handleToggle} />
    ) : (
      <IoEyeSharp className={classNames('endpointInput__icon', { endpointInput__icon__hardware: hardware })} onClick={handleToggle} />
    );

  const showEyes = type === 'password' && edit ? <>{icon}</> : null;

  const validateKeyPress = onlyNumber ? validateDataInput : undefined;

  return (
    <>
      <input
        className={classNames('endpointInput', {
          endpointInput__checkbox: type === 'checkbox',
          endpointInput__active: edit && type !== 'file',
          endpointInput__error: error && error[name],
          endpointInput__radio: type === 'radio',
          endpointInput__file: type === 'file',
          endpointInput__psk: name === 'psk',
          endpointInput__hardware: hardware
        })}
        {...{ type: open && edit ? 'text' : type, name, placeholder, value, onChange, onClick, onKeyPress: validateKeyPress, checked, disabled: !edit, ref: references }}
      />
      {showEyes}
    </>
  );
};
