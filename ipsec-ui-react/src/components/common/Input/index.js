import React from 'react';

import PropTypes from 'prop-types';

// import 'style.scss';

export function Input({ type, name, placeholder, onChange, ref }) {
  return <input type={type} name={name} placeholder={placeholder} onChange={onChange} ref={ref} />;
}

Input.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.required,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.instanceOf(Element) })])
};
