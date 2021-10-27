import { useState } from 'react';
import { useAppContext } from 'hooks/';

export const useNotificationLogic = () => {
  const {
    context: { notifications }
  } = useAppContext();

  const [openLogs, setOpenLogs] = useState(false);
  const handleOpenLogs = () => setOpenLogs((prev) => !prev);

  return { openLogs, handleOpenLogs, notifications };
};
