import { FC } from 'react';
import { EachNotification } from 'template';
import { NotificationsType } from 'interface/index';
import classNames from 'classnames';
import './styles.scss';

interface BoxNotificationType {
  open: boolean;
  handleToggle: () => void;
  notifications: Array<any>;
  handleOpenLogs: () => void;
}

export const BoxNotification: FC<BoxNotificationType> = ({ open, handleToggle, notifications, handleOpenLogs }) => {
  const displayNotification = notifications.length ? (
    notifications.map((notice: NotificationsType, index: number) => <EachNotification key={index} {...notice} />)
  ) : (
    <div className="notification__empty">There are no new notices</div>
  );

  return (
    <div className={classNames('notification', { notification__active: open })} onMouseLeave={handleToggle}>
      <header className="notification__header">
        <h3 className="notification__title">
          New Notifications <span className="notification__amount">2</span>
        </h3>
        <button className="notification__show">Show all</button>
      </header>
      <div className="notification__content">{displayNotification}</div>
      <div className="notification__footer">
        <button className="notification__mark">Mark all as read</button>
      </div>
    </div>
  );
};
