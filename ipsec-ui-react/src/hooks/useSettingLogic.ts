import { SettingOptionType } from 'interface/index';
import { useState } from 'react';

export const useSettingLogic = () => {
  const [activeSetting, setActiveSetting] = useState<SettingOptionType | string>('');

  const handleChangeActiveSetting = (name: SettingOptionType | string) => setActiveSetting(name);

  return { activeSetting, handleChangeActiveSetting };
};
