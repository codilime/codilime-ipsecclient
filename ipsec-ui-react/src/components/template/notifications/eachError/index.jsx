import React from 'react';
import PropTypes from 'prop-types';

export const EachError = ({ time, error }) => {
  return (
    <div className="notifications__log">
      <p className="notifications__time">{time}</p>
      <p className="notifications__response notifications__error">{error}</p>
    </div>
  );
};

EachError.propTypes = {
  time: PropTypes.element,
  error: PropTypes.string
};
