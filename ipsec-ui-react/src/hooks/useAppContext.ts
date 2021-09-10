import React, { useContext } from 'react';
import { VrfsContext } from 'context';

export const useAppContext = () => {
  function AppContext() {
    const ctxValue = useContext(VrfsContext);
    if (ctxValue === null) throw new Error('Expected context value to be set');
    const { vrf, setVrf } = ctxValue;
    return { vrf, setVrf };
  }
  return { AppContext };
};
