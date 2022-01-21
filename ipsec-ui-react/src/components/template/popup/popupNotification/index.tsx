import { ChangeEvent, FC, useEffect, useState } from 'react';
import { Popup, EachError } from 'template';
import { NotificationsType } from 'interface/index';
import { Dotted } from '../../loading';
import './styles.scss';

interface PopupNotificationType {
  open: boolean;
  handleToggle: () => void;
  notifications: NotificationsType[] | [];
}

export const PopupNotification: FC<PopupNotificationType> = ({ open, handleToggle, notifications = [] }) => {
  const [findDate, setFindDate] = useState<string>('');
  const [displayNotification, setDisplayNotification] = useState<NotificationsType[] | []>([]);
  const handleSetFindDate = (e: ChangeEvent<HTMLInputElement>) => setFindDate(e.target.value);

  useEffect(() => {
    setDisplayNotification(notifications);
    if (findDate) {
      const filteredNotification = notifications.filter(({ time }) => time.includes(findDate));
      setDisplayNotification(filteredNotification);
    }
  }, [findDate, notifications]);

  const displayError = displayNotification.length ? displayNotification.map((notice, index) => <EachError key={index} {...notice} />) : <div>Notifications are empty</div>;

  return (
    <Popup {...{ open, handleToggle, title: 'Notifications' }}>
      <div className="notifications__search">
        <label>Find error by date:</label>
        <input className="notifications__input" placeholder="12.19.2021" onChange={handleSetFindDate} />
      </div>
      <section className="notifications">
        <header className="notifications__header">
          <div className="notifications__header__time">Time</div>
          <div className="notifications__response">Response</div>
        </header>
        <div className="notifications__content">{displayError}</div>
      </section>
    </Popup>
  );
};
