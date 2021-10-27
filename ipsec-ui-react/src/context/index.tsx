import { useState, createContext, FunctionComponent, Dispatch, SetStateAction } from 'react';
import { defaultVrf } from 'db';
import { ContextProps } from 'interface/index';

type ContextType = {
  context: ContextProps;
  setContext: Dispatch<SetStateAction<ContextProps>>;
};

export const VrfsContext = createContext<ContextType | null>(null);

export const VrfsProvider: FunctionComponent = ({ children }) => {
  const [context, setContext] = useState<ContextProps>(defaultVrf);

  return <VrfsContext.Provider value={{ context, setContext }}>{children}</VrfsContext.Provider>;
};
