/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { useState, useEffect } from 'react';
import { useFetchData } from 'hooks/';
import { handleTakeTime } from 'utils/';

interface LogData {
  log: string;
  name: string;
}

export const useLogsLogic = () => {
  const [logData, setLogData] = useState<{ log: LogData[] }>({ log: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(false);
  const { fetchLogs } = useFetchData();
  const handleActiveScroll = () => setAutoScroll((prev) => !prev);

  const handleFetchLogsData = async () => {
    const data = await fetchLogs();
    setLogData(data);
  };

  useEffect(() => {
    if (logData !== null) {
      setLoading(false);
    } else setLoading(true);
  }, [logData]);

  const HandleDownloadTextFile = (log: string, name: string) => {
    const element = document.createElement('a');
    if (logData) {
      const file = new Blob([log], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `${handleTakeTime() + name}.txt`;
      document.body.appendChild(element);
      element.click();
    }
  };

  return { logData, autoScroll, loading, handleFetchLogsData, HandleDownloadTextFile, handleActiveScroll };
};
