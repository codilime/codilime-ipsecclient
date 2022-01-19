import { useState, createContext, FC, Dispatch, SetStateAction, useMemo } from 'react';
import { defaultVrf } from 'db';
import { ContextProps } from 'interface/index';

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
