import { useState } from 'react';

export const useToggle = () => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => setOpen((prev) => !prev);

  return { open, handleToggle };
};
