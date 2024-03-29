/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { useEffect, FC, memo } from 'react';
import { CircleInfo, TopSideIcon } from 'common/';
import { BoxNotification, PopupNotification } from 'template';
import { useNotificationLogic } from 'hooks/';
import { FiBell } from 'react-icons/fi';

interface NotificationType {
  open: boolean;
  handleToggle: () => void;
}

export const Notification: FC<NotificationType> = memo(({ open, handleToggle }) => {
  const { openLogs, displayNotifications, newNotifications, handleOpenLogs, handleReadAllNotification, handleReadNotification } = useNotificationLogic();

  const newNotification = newNotifications.length ? <CircleInfo /> : null;

  const notifications = displayNotifications.reverse();

  useEffect(() => {
    if (open && openLogs) handleToggle();
  }, [open, openLogs]);

  return (
    <TopSideIcon>
      <FiBell className="topBar__icon" onClick={handleToggle} />
      {newNotification}
      <BoxNotification {...{ open, handleToggle, notifications, handleOpenLogs, newNotifications, handleReadAllNotification, handleReadNotification }} />
      <PopupNotification {...{ open: openLogs, handleToggle: handleOpenLogs, notifications }} />
    </TopSideIcon>
  );
});
