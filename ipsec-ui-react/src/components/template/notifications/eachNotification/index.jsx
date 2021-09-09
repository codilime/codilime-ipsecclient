import React from 'react';
import PropTypes from 'prop-types';

export const EachNotification = ({ time, description }) => {
  return (
    <div className="notification__each">
      <h4 className="notification__time">{time}</h4>
      <p className="notification__description">{description}</p>
    </div>
  );
};

EachNotification.defaultProps = {
  title: 'tytul',
  description: 'przykładowy tytuł'
};

EachNotification.propTypes = {
  time: PropTypes.element,
  description: PropTypes.string
};
