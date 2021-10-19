import { FC, useEffect } from 'react';
import { Popup, Logs } from 'template';
import { useAppContext, useLogsLogic } from 'hooks/';

interface PopupLogsType {
  open: boolean;
  handleToggle: () => void;
}

export const PopupLogs: FC<PopupLogsType> = ({ open, handleToggle }) => {
  const { logList, handleFetchList } = useLogsLogic();
  const {
    context: { loading }
  } = useAppContext();

  // useEffect(() => {
  //   handleFetchList();
  // }, [loading]);

  return (
    <Popup {...{ open, handleToggle, title: 'Logs' }}>
      <Logs {...{ logList, open }} />
    </Popup>
  );
};
