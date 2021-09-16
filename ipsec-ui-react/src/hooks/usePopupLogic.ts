import React from 'react';
import { useToggle } from 'hooks/';

export const usePopupLogic = () => {
  const { open, handleToggle } = useToggle();

  return { open, handleToggle };
};
