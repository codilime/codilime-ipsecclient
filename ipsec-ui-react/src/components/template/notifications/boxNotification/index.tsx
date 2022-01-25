/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC, useMemo } from 'react';
import { EachNotification } from 'template';
import { NotificationsType } from 'interface/index';
import classNames from 'classnames';
import './styles.scss';

interface BoxNotificationType {
  open: boolean;
  handleToggle: () => void;
  notifications: Array<any>;
  handleOpenLogs: () => void;
  newNotifications: NotificationsType[] | [];
  handleReadAllNotification: () => void;
  handleReadNotification: (notification: number) => void;
}

export const BoxNotification: FC<BoxNotificationType> = ({ open, notifications, newNotifications, handleToggle, handleOpenLogs, handleReadAllNotification, handleReadNotification }) => {
  const displayNewNotification = useMemo(() => {
    return newNotifications.map((notice: NotificationsType) => <EachNotification key={notice.id} {...{ ...notice, onClick: () => handleReadNotification(notice.id), active: true }} />);
  }, [newNotifications]);

  const displayNotification = useMemo(() => {
    return notifications.length ? (
      notifications.map((notice: NotificationsType) => <EachNotification key={notice.id} {...notice} />)
    ) : (
      <div className="notification__empty">There are no new notices</div>
    );
  }, [notifications]);

  return (
    <div className={classNames('notification', { notification__active: open })} onMouseLeave={handleToggle}>
      <header className="notification__header">
        <h3 className="notification__title">
          New Notifications <span className="notification__amount">{newNotifications.length}</span>
        </h3>
        <button className="notification__show" onClick={handleOpenLogs}>
          Show all
        </button>
      </header>
      <div className="notification__new">{displayNewNotification}</div>
      <div className="notification__content">{displayNotification}</div>
      <div className="notification__footer">
        <button className="notification__mark" onClick={handleReadAllNotification}>
          Mark all as read
        </button>
      </div>
    </div>
  );
};
