import { useState, useEffect } from 'react';

export const useSettingLogic = (open) => {
  const [activeSetting, setActiveSetting] = useState({ profile: true, certificate: false });

  const handleChangeActiveSetting = (name) => {
    if (name === 'profile') {
      setActiveSetting({ profile: true, certificate: false });
    }
    if (name === 'certificate') {
      setActiveSetting({ profile: false, certificate: true });
    }
  };
  useEffect(() => {
    if (!open) {
      setActiveSetting({ profile: true, certificate: false });
    }
  }, [open]);

  return { handleChangeActiveSetting, activeSetting };
};
