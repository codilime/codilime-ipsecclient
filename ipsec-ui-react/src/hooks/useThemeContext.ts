import { useContext } from 'react';
import { ThemeContext } from 'context';

export const useThemeContext = () => {
  const ctxValue = useContext(ThemeContext);

  if (ctxValue === null) throw new Error('Expected context value to be set');

  return { ...ctxValue };
};
