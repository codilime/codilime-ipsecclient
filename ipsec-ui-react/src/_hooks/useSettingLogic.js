import { useState, useEffect } from 'react';
import { useToggle } from './useToggle';

export const useSettingLogic = () => {
  const { open, handleToggle } = useToggle();
  const [activeSetting, setActiveSetting] = useState({ profile: true, restConf: false, certificate: false });

  const handleChangeActiveSetting = (name) => {
    if (name === 'profile') {
      setActiveSetting({ profile: true, restConf: false, certificate: false });
    }
    if (name === 'restConf') {
      setActiveSetting({ profile: false, restConf: true, certificate: false });
    }
    if (name === 'certificate') {
      setActiveSetting({ profile: false, restConf: false, certificate: true });
    }
  };

  useEffect(() => {
    if (!open) {
      setActiveSetting({ profile: true, restConf: false, certificate: false });
    }
  }, [open]);

  return { activeSetting, open, handleToggle, handleChangeActiveSetting };
};
