import { useState, useEffect } from 'react';
import { client } from 'api/';
import { restConfType, descriptionType, ChangePasswordType } from 'interface/index';

export const useSettingLogic = (open?: boolean) => {
  const [logged, setLogged] = useState<boolean>(true);
  const [description, setDescription] = useState<descriptionType>({ result: 'default', message: 'The variables are set. If you want to change them, please click reset' });
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
        setLogged(true);
      }
    }, 300);
    return () => {
      clearTimeout(timeout);
    };
  }, [open]);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setDescription({ result: 'default', message: 'The variables are set. If you want to change them, please click reset' });
    }, 2000);
    return () => {
      clearTimeout(timeOut);
    };
  }, [description]);

  const handleSendRestConf = async (data: restConfType) => {
    const username = await client('settings/switch_username', {}, { method: 'POST', body: data.switch_username });
    const password = await client('settings/switch_password', {}, { method: 'POST', body: data.switch_password });
    if (!username || !password) {
      setLogged(true);
      setDescription({ result: 'error', message: 'Error change, something is wrong' });
    }
    if (username && password) {
      setLogged(true);
      setDescription({ result: 'success', message: 'Successful change. New variables saved' });
    }
  };

  const handleResetRestConf = () => {
    setLogged(false);
  };

  // const handleChangeGlobalPassword = async (data: ChangePasswordType) => {
  //   const { status } = await client('changepass', {}, { method: 'POST', body: data.newPassword });
  //   if (status === 'ok') {
  //     setLogged(true);
  //     setDescription({ result: 'success', message: 'Successful change. New variables saved' });
  //   }
  //   if (!status) {
  //     setLogged(true);
  //     setDescription({ result: 'error', message: 'Error change, something is wrong' });
  //   }
  // };

  return { activeSetting, logged, description, handleChangeActiveSetting, handleSendRestConf, handleResetRestConf, setLogged };
};
