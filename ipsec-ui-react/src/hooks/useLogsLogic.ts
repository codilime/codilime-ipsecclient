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

  const handleActioveScroll = () => setAutoScroll((prev) => !prev);

  const handleFetchLogsData = async () => {
    const data = await fetchLogs();
    setLogData(data);
  };

  useEffect(() => {
    if (logData !== null) {
      setLoading(false);
    } else setLoading(true);
  }, [logData]);

  const HandleDownloadTextFile = (log: string, title: string) => {
    const element = document.createElement('a');
    if (logData) {
      const file = new Blob([log], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `${handleTakeTime() + title}.txt`;
      document.body.appendChild(element);
      element.click();
    }
  };

  return { logData, autoScroll, loading, handleFetchLogsData, HandleDownloadTextFile, handleActioveScroll };
};
