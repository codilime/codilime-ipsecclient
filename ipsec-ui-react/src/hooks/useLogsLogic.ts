import { useState } from 'react';
import { useFetchData } from 'hooks/';
import { handleTakeTime } from 'utils/';

export const useLogsLogic = () => {
  const [logList, setLogList] = useState<string[]>([]);
  const [logData, setLogData] = useState<string>('');
  const { fetchLogsList, fetchLogsData } = useFetchData();

  const handleFetchList = async () => {
    const list = await fetchLogsList();
    setLogList(list);
  };

  const handleFetchLogsData = async (logs: string) => {
    const data = await fetchLogsData(logs);
    setLogData(data);
  };

  const HandleDownloadTextFile = (title: string) => {
    const element = document.createElement('a');
    const file = new Blob([logData], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${handleTakeTime() + title}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return { logList, logData, handleFetchLogsData, handleFetchList, HandleDownloadTextFile };
};
