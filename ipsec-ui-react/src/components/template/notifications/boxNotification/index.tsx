import { FC } from 'react';
import { Wrapper, EachNotification } from 'template';
import classNames from 'classnames';
import { NotificationsType } from 'interface/index';
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
      <Wrapper {...{ title: 'Unsaved changes', headerAction: 'Show all logs', small: true, onClick: handleOpenLogs }}>
        <div className="notification__content">{displayNotification}</div>
      </Wrapper>
    </div>
  );
};
