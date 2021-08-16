import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IoEyeSharp } from 'react-icons/io5';
import { BsEyeSlashFill } from 'react-icons/bs';
import { useToggle } from 'hooks';
import classNames from 'classnames';
import './styles.scss';

export const EndpointInput = ({ type, placeholder, name, value, edit, onChange, disabled }) => {
    const { open, handleToggle } = useToggle();
    const [alert, setAlert] = useState(false);

    const icon = open ? <BsEyeSlashFill className="endpointInput__icon" onClick={handleToggle} /> : <IoEyeSharp className="endpointInput__icon" onClick={handleToggle} />;

    const showEyes = type === 'password' ? <>{icon}</> : null;
    const validateDataInput = (event) => {
        if (!/[0-9.]/.test(event.key) && event.target.name !== 'psk') {
            event.preventDefault();
            setAlert(true);
            return;
        }
        setAlert(false);
    };
    return (
        <>
            <input
                className={classNames({ endpointInput: true, endpointInput__checkbox: type === 'checkbox', endpointInput__active: edit })}
                type={open ? 'text' : type}
                onKeyPress={validateDataInput}
                {...{ name, placeholder, value, disabled, onChange }}
            />
            {showEyes}
        </>
    );
};

EndpointInput.defaultProps = {
    checked: true
};

EndpointInput.propTypes = {
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    edit: PropTypes.bool,
    disabled: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    onChange: PropTypes.func
};
