import React, { useState, createContext, FunctionComponent, Dispatch, SetStateAction } from 'react';
import { defaultVrf } from 'db';
import { VrfType } from '../interface/components';

export interface contextType {
  vrf: VrfType;
  setVrf: Dispatch<SetStateAction<VrfType>>;
}

export const VrfsContext = createContext<contextType | null>(null);

export const VrfsProvider: FunctionComponent = ({ children }) => {
  const [vrf, setVrf] = useState<VrfType>(defaultVrf);
  return <VrfsContext.Provider value={{ vrf, setVrf }}>{children}</VrfsContext.Provider>;
};
