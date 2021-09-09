import React, { FC } from 'react';
import { Wrapper, EachNotification } from 'template';
import classNames from 'classnames';
import './styles.scss';

interface BoxNotificationProps {
  open: boolean;
  handleToggle: () => void;
  handleOpenLogs: () => void;
  notifications: string[];
}

export const BoxNotification: FC<BoxNotificationProps> = ({ open, handleToggle, notifications = [''], handleOpenLogs }) => {
  const displayNotification = notifications.length ? (
    notifications.map((notice, index) => <EachNotification key={index} {...notice} />)
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
