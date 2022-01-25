/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC, useEffect } from 'react';
import { Popup, Logs } from 'template';
import { useLogsLogic } from 'hooks/';

interface PopupLogsType {
  open: boolean;
  handleToggle: () => void;
}

export const PopupLogs: FC<PopupLogsType> = ({ open, handleToggle }) => {
  const {
    logData: { log },
    handleFetchLogsData
  } = useLogsLogic();

  useEffect(() => {
    if (open) handleFetchLogsData();
  }, [open]);

  useEffect(() => {
    if (open) {
      const interval = setInterval(() => {
        handleFetchLogsData();
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [open]);

  return <Popup {...{ open, handleToggle, title: 'Logs' }}>{log && <Logs {...{ logData: log, open }} />}</Popup>;
};
