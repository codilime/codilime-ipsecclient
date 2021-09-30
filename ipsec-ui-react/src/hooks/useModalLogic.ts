import { MouseEvent, useState } from 'react';

export const useModalLogic = () => {
  const [show, setShow] = useState(false);

  const handleToggleModal = () => setShow((prev) => !prev);

  const stopPropagation = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation();

  return { show, handleToggleModal, stopPropagation };
};
