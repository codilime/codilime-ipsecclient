import { useState, useEffect } from 'react';
import { client } from 'api/';
import { restConfType, descriptionType } from 'interface/index';

export const UseRestConfLogic = (open: boolean) => {
  const [logged, setLogged] = useState<boolean>(true);
  const [description, setDescription] = useState<descriptionType>({ result: 'default', message: 'The variables are set. If you want to change them, please click reset' });

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setDescription({ result: 'default', message: 'The variables are set. If you want to change them, please click reset' });
    }, 2000);
    return () => {
      clearTimeout(timeOut);
    };
  }, [description]);

  useEffect(() => {
    if (!open) {
      setLogged(true);
    }
  }, [open]);

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

  const handleResetRestConf = () => setLogged(false);

  return { handleResetRestConf, handleSendRestConf, description, logged };
};
