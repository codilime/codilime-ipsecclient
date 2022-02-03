/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

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
    const { switch_address, switch_password, switch_username } = data;
    if (switch_address) {
      const adress = await client('setting=switch_address', { setting: { name: 'switch_password', value: data.switch_address } }, { method: 'POST' });
      if (!adress) {
        setActive(true);
        return setDescription({ result: 'error', message: 'Error change, something is wrong' });
      }
    }
    if (switch_password) {
      const password = await client('setting=switch_password', { setting: { name: 'switch_password', value: data.switch_password } }, { method: 'POST' });
      if (!password) {
        setActive(true);
        return setDescription({ result: 'error', message: 'Error change, something is wrong' });
      }
    }
    if (switch_username) {
      const username = await client('setting=switch_username', { setting: { name: 'switch_username', value: data.switch_username } }, { method: 'POST' });
      if (!username) {
        setActive(true);
        return setDescription({ result: 'error', message: 'Error change, something is wrong' });
      }
    }

    const { check_switch_basic_auth } = await client('check-switch-basic-auth');
    if (!check_switch_basic_auth) {
      setActive(true);
      return setDescription({ result: 'error', message: 'Error, basic auth is incorrect' });
    }
    if (check_switch_basic_auth) {
      setActive(true);
      return setDescription({ result: 'success', message: 'Successful change, New variables saved' });
    }
  };

  const handleResetRestConf = () => setActive(false);

  return { handleResetRestConf, handleSendRestConf, description, active };
};
