import React from 'react';
import PropTypes from 'prop-types';

export const EachNotification = ({ title, description, onClick }) => {
  return (
    <div className="notification__each">
      <header className="notification__header">
        <h2 className="notification__title">{title}</h2>
      </header>
      <p className="notification__description">{description}</p>
      <button {...{ onClick }} className="notification__btn">
        View
      </button>
    </div>
  );
};

EachNotification.defaultProps = {
  title: 'tytul',
  description: 'przykładowy tytuł'
};

EachNotification.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  onClick: PropTypes.func
};
