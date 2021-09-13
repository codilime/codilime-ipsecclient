import { useContext } from 'react';
import { VrfsContext } from 'context';

export const useGetContextValues = () => {
  const ctx = useContext(VrfsContext);

  if (ctx === null) throw new Error('Got null, expected some kind of value');

  return { ...ctx };
};
