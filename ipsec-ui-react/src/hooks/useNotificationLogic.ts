/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { useEffect, useLayoutEffect, useState } from 'react';
import { useAppContext } from 'hooks/';
import { NotificationsType } from 'interface/index';
import { useFetchData } from './useFetchData';

export const useNotificationLogic = () => {
  const {
    context: { notifications, loading }
  } = useAppContext();
  const { fetchErrorData } = useFetchData();

  const [openLogs, setOpenLogs] = useState(false);
  const [displayNotifications, setDisplayNotifications] = useState<NotificationsType[] | []>([]);
  const [newNotifications, setNewNotifications] = useState<NotificationsType[] | []>([]);

  useLayoutEffect(() => {
    if (!displayNotifications.length) setDisplayNotifications(notifications);
  }, [notifications]);

  const handleFetchNewNotifications = async () => {
    const { error } = await fetchErrorData();
    if (!error) return;
    const newNotifications = error.filter((err: any) => !displayNotifications.find((notice) => notice.id === err.id));
    setNewNotifications(newNotifications);
  };

  useEffect(() => {
    if (displayNotifications.length) {
      handleFetchNewNotifications();
    }
  }, [loading]);

  const handleReadNotification = (notification: number) => {
    const readedNotifications = newNotifications.filter(({ id }) => id === notification);
    const otherNotifications = newNotifications.filter(({ id }) => {
      id !== notification;
    });
    setNewNotifications(otherNotifications);
    setDisplayNotifications((prev) => [...prev, ...readedNotifications]);
  };

  const handleReadAllNotification = () => {
    setNewNotifications([]);
    setDisplayNotifications((prev) => [...prev, ...newNotifications]);
  };

  const handleOpenLogs = () => setOpenLogs((prev) => !prev);
  return { handleOpenLogs, openLogs, displayNotifications, newNotifications, handleReadNotification, handleReadAllNotification };
};
