import { useContext } from 'react';
import { VrfsContext } from 'context';

export const useGetContextValues = () => {
  const ctx = useContext(VrfsContext);

  return ctx !== null ? VrfsContext : null;
};
