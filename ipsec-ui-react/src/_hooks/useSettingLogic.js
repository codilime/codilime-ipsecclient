import { useState, useEffect } from 'react';

export const useSettingLogic = (open) => {
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
      setActiveSetting({ profile: true, certificate: false });
    }
  }, [open]);

  return { handleChangeActiveSetting, activeSetting };
};
