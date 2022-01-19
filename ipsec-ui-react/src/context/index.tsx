import { useState, createContext, FC, Dispatch, SetStateAction, useMemo } from 'react';
import { defaultData, defaultVrf, DefaultVrfData } from 'db';
import { AppContextType, ContextProps, VrfDataTypes } from 'interface/index';

type ContextType = {
  context: ContextProps;
  setContext: Dispatch<SetStateAction<ContextProps>>;
};

export const VrfsContext = createContext<ContextType | null>(null);

export const VrfsProvider: FC = ({ children }) => {
  const [context, setContext] = useState<ContextProps>(defaultVrf);
  const value = useMemo(
    () => ({
      context,
      setContext
    }),
    [context]
  );
  return <VrfsContext.Provider value={value}>{children}</VrfsContext.Provider>;
};

/* Theme context */
enum ThemeType {
  dark = 'dark',
  light = 'light'
}

type ContextThemeType = {
  theme: ThemeType;
  setTheme: Dispatch<SetStateAction<ThemeType>>;
};

export const ThemeContext = createContext<ContextThemeType | null>(null);

export const ThemeProvider: FC = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(ThemeType.light);
  const value = useMemo(
    () => ({
      theme,
      setTheme
    }),
    [theme]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

type VrfContext = {
  vrfContext: VrfDataTypes;
  setVrfContext: Dispatch<SetStateAction<VrfDataTypes>>;
};

export const VrfContext = createContext<VrfContext | null>(null);

export const VrfProvider: FC = ({ children }) => {
  const [vrfContext, setVrfContext] = useState<VrfDataTypes>(DefaultVrfData);

  const value = useMemo(
    () => ({
      vrfContext,
      setVrfContext
    }),
    [vrfContext]
  );
  return <VrfContext.Provider value={value}>{children}</VrfContext.Provider>;
};

type AppContext = {
  appContext: AppContextType;
  setAppContext: Dispatch<SetStateAction<AppContextType>>;
};

export const AppContext = createContext<AppContext | null>(null);

export const AppProvider: FC = ({ children }) => {
  const [appContext, setAppContext] = useState<AppContextType>(defaultData);

  const value = useMemo(
    () => ({
      appContext,
      setAppContext
    }),
    [appContext]
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
