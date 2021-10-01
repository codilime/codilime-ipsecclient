import { useState, useEffect } from 'react';
import { useFetchData } from 'hooks/';
import { handleTakeTime } from 'utils/';

export const useLogsLogic = () => {
  const [logList, setLogList] = useState<string[]>([]);
  const [logData, setLogData] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(false);

  const { fetchLogsList, fetchLogsData } = useFetchData();

  const handleActioveScroll = () => setAutoScroll((prev) => !prev);

  const handleFetchList = async () => {
    const list = await fetchLogsList();
    setLogList(list);
  };

  const handleFetchLogsData = async (logs: string) => {
    const data = await fetchLogsData(logs);
    setLogData(data);
  };

  useEffect(() => {
    if (logData !== null) {
      setLoading(false);
    } else setLoading(true);
  }, [logData]);

  const HandleDownloadTextFile = (title: string) => {
    const element = document.createElement('a');
    if (logData) {
      const file = new Blob([logData], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `${handleTakeTime() + title}.txt`;
      document.body.appendChild(element);
      element.click();
    }
  };

  return { logList, logData, autoScroll, loading, handleFetchLogsData, handleFetchList, HandleDownloadTextFile, handleActioveScroll };
};
