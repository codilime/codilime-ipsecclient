import { FC } from 'react';
import { IoEyeSharp } from 'react-icons/io5';
import { BsEyeSlashFill } from 'react-icons/bs';
import { validateDataInput } from 'utils/';
import { useToggle } from 'hooks/';
import classNames from 'classnames';
import { InputType } from 'interface/components';
import './styles.scss';

type errorProps = {
  remote_ip_se: boolean;
  psk: boolean;
  local_ip: boolean;
  peer_ip: boolean;
};

interface endpointInputTypes extends InputType {
  edit?: boolean;
  error?: keyof errorProps | any;
}

export const EndpointInput: FC<endpointInputTypes> = ({ type, placeholder, name, value, edit, onChange, onClick, checked, error, references }) => {
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
