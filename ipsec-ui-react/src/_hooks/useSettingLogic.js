import { useState } from 'react';
import { useToggle } from 'hooks';

export const useSettingLogic = () => {
  const [activeSetting, setActiveSetting] = useState({ login: true, certificate: false, kredki: false });

  const { open, handleToggle } = useToggle();
  const handleChangeActiveSetting = (name) => {
    if (name === 'login') {
      setActiveSetting({ login: true, certificate: false, kredki: false });
    }
    if (name === 'certificate') {
      setActiveSetting({ login: false, certificate: true, kredki: false });
    }
    if (name === 'kredki') {
      setActiveSetting({ login: false, certificate: false, kredki: true });
    }
  };

  return { open, handleToggle, handleChangeActiveSetting, activeSetting };
};
