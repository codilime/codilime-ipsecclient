import { useState, useEffect } from 'react';
import { client } from 'api/';
import { RestConfType, DescriptionType } from 'interface/index';

export const UseRestConfLogic = (open: boolean) => {
  const [logged, setLogged] = useState<boolean>(true);
  const [description, setDescription] = useState<DescriptionType>({ result: 'default', message: 'The variables are set. If you want to change them, please click reset' });

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

  const handleSendRestConf = async (data: RestConfType) => {
    const username = await client('setting=switch_username', { setting: { name: 'switch_username', value: data.switch_username } }, { method: 'POST' });
    const password = await client('setting=switch_password', { setting: { name: 'switch_password', value: data.switch_password } }, { method: 'POST' });
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
