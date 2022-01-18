import { useState, createContext, FC, Dispatch, SetStateAction } from 'react';
import { defaultVrf } from 'db';
import { ContextProps } from 'interface/index';

type ContextType = {
  context: ContextProps;
  setContext: Dispatch<SetStateAction<ContextProps>>;
};

export const VrfsContext = createContext<ContextType | null>(null);

export const VrfsProvider: FC = ({ children }) => {
  const [context, setContext] = useState<ContextProps>(defaultVrf);
  return <VrfsContext.Provider value={{ context, setContext }}>{children}</VrfsContext.Provider>;
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
  const [theme, setTheme] = useState<ThemeType>(ThemeType.dark);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
