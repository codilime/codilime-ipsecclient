import { useState } from 'react';
import { useToggle } from 'hooks';

export const useSettingLogic = () => {
  const [activeSetting, setActiveSetting] = useState({ profile: true, certificate: false });

  const { open, handleToggle } = useToggle();
  const handleChangeActiveSetting = (name) => {
    if (name === 'profile') {
      setActiveSetting({ profile: true, certificate: false });
    }
    if (name === 'certificate') {
      setActiveSetting({ profile: false, certificate: true });
    }
  };

  return { open, handleToggle, handleChangeActiveSetting, activeSetting };
};
