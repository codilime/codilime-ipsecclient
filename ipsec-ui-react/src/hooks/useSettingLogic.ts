import { SettingOptionType } from 'interface/index';
import { useState, useEffect } from 'react';

export const useSettingLogic = (open?: boolean) => {
  const [activeSetting, setActiveSetting] = useState<keyof SettingOptionType>('Profile');

  const handleChangeActiveSetting = (name: keyof SettingOptionType) => setActiveSetting(name);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!open) setActiveSetting('Profile');
    }, 300);
    return () => {
      clearTimeout(timeout);
    };
  }, [open]);

  return { activeSetting, handleChangeActiveSetting };
};
