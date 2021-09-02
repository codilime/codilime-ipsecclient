import React from 'react';
import { Popup, EachError } from 'template';
import PropTypes from 'prop-types';
import './styles.scss';

export const PopupNotification = ({ open, handleToggle, notifications }) => {
  const displayError = notifications.map((error, index) => <EachError key={index} {...error} />);

  return (
    <Popup {...{ open, handleToggle, title: 'Notifications' }}>
      <div className="notifications__search">
        <label>Find error by date:</label>
        <input className="notifications__input" placeholder="12.19.2021" />
      </div>
      <section className="notifications">
        <header className="notifications__header">
          <div className="notifications__time">Time</div>
          <div className="notifications__response">Response</div>
        </header>
        {displayError}
      </section>
    </Popup>
  );
};

PopupNotification.defaultProps = {
  notifications: []
};

PopupNotification.propTypes = {
  open: PropTypes.bool,
  handleToggle: PropTypes.func,
  notifications: PropTypes.array
};
