/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { SettingOptionType } from 'interface/index';
import { useState } from 'react';

export const useSettingLogic = () => {
  const [activeSetting, setActiveSetting] = useState<SettingOptionType | string>('');

  const handleChangeActiveSetting = (name: SettingOptionType | string) => setActiveSetting(name);

  return { activeSetting, handleChangeActiveSetting };
};
