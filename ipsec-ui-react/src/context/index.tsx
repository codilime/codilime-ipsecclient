import { useState, createContext, FunctionComponent, Dispatch, SetStateAction } from 'react';
import { defaultVrf } from 'db';
import { ContextProps } from 'interface/index';

type ContextType = {
  vrf: ContextProps;
  setVrf: Dispatch<SetStateAction<ContextProps>>;
};

export const VrfsContext = createContext<ContextType | null>(null);

export const VrfsProvider: FunctionComponent = ({ children }) => {
  const [vrf, setVrf] = useState<ContextProps>(defaultVrf);

  return <VrfsContext.Provider value={{ vrf, setVrf }}>{children}</VrfsContext.Provider>;
};
