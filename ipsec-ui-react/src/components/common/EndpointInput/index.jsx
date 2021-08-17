import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IoEyeSharp } from 'react-icons/io5';
import { BsEyeSlashFill } from 'react-icons/bs';
import { useToggle } from 'hooks';
import { validateDataInput } from 'utils/util.js';
import classNames from 'classnames';
import './styles.scss';

export const EndpointInput = ({ type, placeholder, name, value, edit, onChange, onClick, checked }) => {
  const { open, handleToggle } = useToggle();

  const icon = open && edit ? <BsEyeSlashFill className="endpointInput__icon" onClick={handleToggle} /> : <IoEyeSharp className="endpointInput__icon" onClick={handleToggle} />;

  const showEyes = type === 'password' ? <>{icon}</> : null;
  return (
    <>
      <input
        className={classNames({ endpointInput: true, endpointInput__checkbox: type === 'checkbox', endpointInput__active: edit })}
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
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  onChange: PropTypes.func,
  onClick: PropTypes.func
};
