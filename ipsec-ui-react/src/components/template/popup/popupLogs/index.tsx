import { FC, useEffect } from 'react';
import { Popup, Logs } from 'template';
import { useLogsLogic } from 'hooks/';

interface PopupLogsType {
  open: boolean;
  handleToggle: () => void;
}

export const PopupLogs: FC<PopupLogsType> = ({ open, handleToggle }) => {
  const { logList, handleFetchList } = useLogsLogic();

  useEffect(() => {
    handleFetchList();
  }, []);

  return (
    <Popup {...{ open, handleToggle, title: 'Logs' }}>
      <Logs {...{ logList }} />
    </Popup>
  );
};
