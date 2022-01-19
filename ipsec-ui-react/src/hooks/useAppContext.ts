import { useContext } from 'react';
import { VrfContext, VrfsContext, AppContext } from 'context';

export const useAppContext = () => {
  const ctxValue = useContext(VrfsContext);

  if (ctxValue === null) throw new Error('Expected context value to be set');

  return { ...ctxValue };
};

export const useVrfContext = () => {
  const ctxValue = useContext(VrfContext);

  if (ctxValue === null) throw new Error('Expected context value to be set');

  return { ...ctxValue };
};

export const useDataContext = () => {
  const ctxValue = useContext(AppContext);

  if (ctxValue === null) throw new Error('Expected context value to be set');

  return { ...ctxValue };
};
