import { useState, createContext, FunctionComponent, Dispatch, SetStateAction } from 'react';
import { defaultVrf } from 'db';
import { ContextProps } from '../interface';

type contextType = {
  vrf: ContextProps;
  setVrf: Dispatch<SetStateAction<ContextProps>>;
};

export const VrfsContext = createContext<contextType | null>(null);


export const VrfsProvider: FunctionComponent = ({ children }) => {
  const [vrf, setVrf] = useState<ContextProps>(defaultVrf);

  return <VrfsContext.Provider value={{ vrf, setVrf }}>{children}</VrfsContext.Provider>;
};
