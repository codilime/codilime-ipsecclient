import { useState } from 'react';

export const useModalLogic = () => {
  const [show, setShow] = useState(false);

  const handleToggleModal = () => setShow((prev) => !prev);

  const stopPropagation = (e) => e.stopPropagation();

  return { show, handleToggleModal, stopPropagation };
};
