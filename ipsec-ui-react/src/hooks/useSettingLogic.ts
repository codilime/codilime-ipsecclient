import { useState, useEffect } from 'react';

export const useSettingLogic = (open?: boolean) => {
  const [activeSetting, setActiveSetting] = useState({ profile: true, restConf: false, certificate: false });

  const handleChangeActiveSetting = (name: string) => {
    switch (name) {
      case 'profile':
        return setActiveSetting({ profile: true, restConf: false, certificate: false });
      case 'restConf': {
        return setActiveSetting({ profile: false, restConf: true, certificate: false });
      }
      default:
        return setActiveSetting({ profile: false, restConf: false, certificate: true });
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!open) setActiveSetting({ profile: true, restConf: false, certificate: false });
    }, 300);
    return () => {
      clearTimeout(timeout);
    };
  }, [open]);

  return { activeSetting, handleChangeActiveSetting };
};
