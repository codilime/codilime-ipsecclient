import { useState } from 'react';
import { useAppContext } from 'hooks/';

export const useNotificationLogic = () => {
  const { AppContext } = useAppContext();
  const {
    vrf: { notifications }
  } = AppContext();

  const [openLogs, setOpenLogs] = useState(false);
  const handleOpenLogs = () => setOpenLogs((prev) => !prev);

  return { openLogs, handleOpenLogs, notifications };
};
