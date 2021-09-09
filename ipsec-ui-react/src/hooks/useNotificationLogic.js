import { useState, useContext } from 'react';
import { VrfsContext } from 'context';

export const useNotificationLogic = () => {
  const {
    vrf: { notifications }
  } = useContext(VrfsContext);

  const [openLogs, setOpenLogs] = useState(false);
  const handleOpenLogs = () => setOpenLogs((prev) => !prev);

  return { openLogs, handleOpenLogs, notifications };
};
