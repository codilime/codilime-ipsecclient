import React from "react";
import PropTypes from "prop-types";
import { IoEyeSharp } from "react-icons/io5";
import { BsEyeSlashFill } from "react-icons/bs";
import { useToggle } from "hooks";
import "./styles.scss";

export const EndpointInput = ({
    type,
    placeholder,
    name,
    value,
    active,
    onChange,
    disabled,
    checked,
}) => {
    const { open, handleToggle } = useToggle();

    const icon = open ? (
        <BsEyeSlashFill
            className="endpointInput__icon"
            onClick={handleToggle}
        />
    ) : (
        <IoEyeSharp className="endpointInput__icon" onClick={handleToggle} />
    );

    const showEyes = type === "password" ? <>{icon}</> : null;

    return (
        <>
            <input
                className={`endpointInput 
                ${type === "checkbox" ? "endpointInput__checkbox" : ""}
                ${active ? "endpointInput__active" : ""}`}
                type={open ? "text" : type}
                {...{ name, placeholder, value, disabled, onChange }}
            />
            {showEyes}
        </>
    );
};

EndpointInput.defaultProps = {
    checked: true,
};

EndpointInput.propTypes = {
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    checked: PropTypes.bool,
    active: PropTypes.bool,
    disabled: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    onChange: PropTypes.func,
};
