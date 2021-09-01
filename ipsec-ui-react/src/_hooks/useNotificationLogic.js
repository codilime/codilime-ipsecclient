import { useToggle } from './useToggle';

export const useNotificationLogic = () => {
  const { open, handleToggle } = useToggle();

  return { open, handleToggle };
};
