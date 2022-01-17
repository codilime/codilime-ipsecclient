import { useState, useEffect } from 'react';
import { client } from 'api/';
import { RestConfType, DescriptionType } from 'interface/index';

export const UseRestConfLogic = (open: boolean) => {
  const [active, setActive] = useState<boolean>(true);
  const [description, setDescription] = useState<DescriptionType>({ result: 'default', message: 'If you want to change them, please click reset button' });

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setDescription({ result: 'default', message: 'If you want to change them, please click reset button' });
    }, 2000);
    return () => {
      clearTimeout(timeOut);
    };
  }, [description]);

  useEffect(() => {
    if (!open) {
      setActive(true);
    }
  }, [open]);

  const handleSendRestConf = async (data: RestConfType) => {
    const username = await client('setting=switch_username', { setting: { name: 'switch_username', value: data.switch_username } }, { method: 'POST' });
    const password = await client('setting=switch_password', { setting: { name: 'switch_password', value: data.switch_password } }, { method: 'POST' });
    if (!username || !password) {
      setActive(true);
      setDescription({ result: 'error', message: 'Error change, something is wrong' });
    }
    if (username && password) {
      setActive(true);
      setDescription({ result: 'success', message: 'Successful change. New variables saved' });
    }
  };

  const handleResetRestConf = () => setActive(false);

  return { handleResetRestConf, handleSendRestConf, description, active };
};
