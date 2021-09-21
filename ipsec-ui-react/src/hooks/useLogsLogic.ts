import { useState } from 'react';
import { useFetchData } from 'hooks/';

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

  return { logList, logData, handleFetchLogsData, handleFetchList };
};
