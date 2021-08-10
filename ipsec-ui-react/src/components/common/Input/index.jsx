import React from 'react';

import PropTypes from 'prop-types';

export function Input({ type, name, placeholder, onChange, ref, value }) {
  // console.log("value", value);
  // console.log("type", type);
  // console.log("name", name);
  // console.log("ref", ref);

  return <input className="field__input" value={value} type={type} name={name} placeholder={placeholder} onChange={onChange} ref={ref} />;
}

Input.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.instanceOf(Element) })])
};
