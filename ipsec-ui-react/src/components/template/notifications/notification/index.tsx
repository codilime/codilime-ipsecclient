import React, { FC, useEffect } from 'react';
import { CircleInfo, TopSideIcon } from 'common';
import { BoxNotification, PopupNotification } from 'template';
import { useNotificationLogic } from 'hooks';
import { FiBell } from 'react-icons/fi';

interface INotification {
  open: boolean;
  handleToggle: () => void;
}

export const Notification: FC<INotification> = ({ open, handleToggle }) => {
  const { openLogs, handleOpenLogs, notifications } = useNotificationLogic();

  const newNotification = notifications.length ? <CircleInfo /> : null;
  const logs = notifications.reverse();

  useEffect(() => {
    if (open && openLogs) handleToggle();
  }, [open, openLogs]);

  return (
    <TopSideIcon>
      <>
        <FiBell className="topBar__icon" onClick={handleToggle} />
        {newNotification}
        <BoxNotification {...{ open, handleToggle, notifications: logs, handleOpenLogs }} />
        <PopupNotification {...{ open: openLogs, handleToggle: handleOpenLogs, notifications: logs }} />
      </>
    </TopSideIcon>
  );
};
