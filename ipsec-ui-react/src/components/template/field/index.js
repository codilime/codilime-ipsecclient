import React from "react";

import PropTypes from "prop-types";

import { Input } from "common";
import './style.scss'


export const Field = ({text, type, name, placeholder, onChange, ref}) => {
    return (
        <div className='field'>
            <label className='field__label'>{text}</label>
            <Input {...{type, name, placeholder, onChange, ref}}/>
        </div>
    )
}

Field.propTypes = {
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    text: PropTypes.string,
    ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.instanceOf(Element) })])
};


