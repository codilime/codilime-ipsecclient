import React, { useState, createContext, FunctionComponent } from 'react';
import { defaultVrf } from 'db';

export const VrfsContext = createContext(defaultVrf);

export const VrfsProvider: FunctionComponent = ({ children }) => {
  const [vrf, setVrf] = useState(defaultVrf);
  // @ts-ignore TODO
  return <VrfsContext.Provider value={{ vrf, setVrf }}>{children}</VrfsContext.Provider>;
};
