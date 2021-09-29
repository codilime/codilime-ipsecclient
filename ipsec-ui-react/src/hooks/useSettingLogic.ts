import { useState, useEffect } from 'react';

export const useSettingLogic = (open?: boolean) => {
  const [activeSetting, setActiveSetting] = useState({ profile: true, restConf: false, certificate: false });

  const handleChangeActiveSetting = (name: string) => {
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
    const timeout = setTimeout(() => {
      if (!open) {
        setActiveSetting({ profile: true, restConf: false, certificate: false });
      }
    }, 300);
    return () => {
      clearTimeout(timeout);
    };
  }, [open]);

  return { activeSetting, handleChangeActiveSetting };
};
