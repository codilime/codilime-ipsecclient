import React, { FC } from 'react';
import { Popup, EachError } from 'template';
import './styles.scss';

interface IPopupNotification {
  open: boolean;
  handleToggle: () => void;
  notifications: Array<string>;
}

export const PopupNotification: FC<IPopupNotification> = ({ open, handleToggle, notifications = [] }) => {
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