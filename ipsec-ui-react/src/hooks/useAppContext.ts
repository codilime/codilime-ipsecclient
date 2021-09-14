import { useContext } from 'react';
import { VrfsContext } from 'context';

export const useAppContext = () => {
  const ctxValue = useContext(VrfsContext);

  if (ctxValue === null) throw new Error('Expected context value to be set');

  return { ...ctxValue };
};
