import { useState, createContext, FC, Dispatch, SetStateAction } from 'react';
import { defaultVrf } from 'db';
import { ContextProps } from 'interface/index';

type ContextType = {
  context: ContextProps;
  setContext: Dispatch<SetStateAction<ContextProps>>;
};

type ThemeType = {
  dark: 'dark';
  light: 'light';
  common: 'common';
};

type ContextThemeType = {
  theme: keyof ThemeType;
  setTheme: Dispatch<SetStateAction<keyof ThemeType>>;
};

export const VrfsContext = createContext<ContextType | null>(null);

export const VrfsProvider: FC = ({ children }) => {
  const [context, setContext] = useState<ContextProps>(defaultVrf);

  return <VrfsContext.Provider value={{ context, setContext }}>{children}</VrfsContext.Provider>;
};

export const ThemeContext = createContext<ContextThemeType | null>(null);

export const ThemeProvider: FC = ({ children }) => {
  const [theme, setTheme] = useState<keyof ThemeType>('dark');
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
