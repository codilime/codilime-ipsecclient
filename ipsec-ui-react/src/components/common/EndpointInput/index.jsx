import React from 'react';
import PropTypes from 'prop-types';
import { IoEyeSharp } from 'react-icons/io5';
import { BsEyeSlashFill } from 'react-icons/bs';
import { validateDataInput } from 'utils/util.js';
import { useToggle } from 'hooks';
import classNames from 'classnames';
import './styles.scss';

export const EndpointInput = ({ type, placeholder, name, value, edit, onChange, onClick, checked, error }) => {
  const { open, handleToggle } = useToggle();
  const icon = open && edit ? <BsEyeSlashFill className="endpointInput__icon" onClick={handleToggle} /> : <IoEyeSharp className="endpointInput__icon" onClick={handleToggle} />;

  const showEyes = type === 'password' ? <>{icon}</> : null;
  return (
    <>
      <input
        className={classNames('endpointInput', { endpointInput__checkbox: type === 'checkbox', endpointInput__active: edit, endpointInput__error: error[name] })}
        type={open && edit ? 'text' : type}
        onKeyPress={validateDataInput}
        disabled={!edit}
        {...{ name, placeholder, value, onChange, onClick, checked }}
      />
      {showEyes}
    </>
  );
};

EndpointInput.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  edit: PropTypes.bool,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.number]),
  error: PropTypes.shape({ remote_ip_sec: PropTypes.bool, psk: PropTypes.bool, local_ip: PropTypes.bool, peer_ip: PropTypes.bool })
};
