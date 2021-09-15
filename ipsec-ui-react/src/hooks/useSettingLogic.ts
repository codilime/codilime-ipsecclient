import { useState, useEffect } from 'react';
import { useToggle } from './useToggle';
import { client } from 'api/';

export const useSettingLogic = () => {
  const { open, handleToggle } = useToggle();
  const [logged, setLogged] = useState<boolean>(false);
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
    if (!open) {
      setActiveSetting({ profile: true, restConf: false, certificate: false });
    }
  }, [open]);

  const handleSendRestConf = async (data: any) => {
    const res = await client('/settings/restConf', { ...data }, { method: 'POST' });
    if (res.result === 'success') {
      setLogged(true);
    }
  };

  const handleResetRestConf = () => {
    setLogged(false);
  };

  return { activeSetting, open, handleToggle, handleChangeActiveSetting, handleSendRestConf, handleResetRestConf };
};
