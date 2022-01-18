import { FC } from 'react';
import { useThemeContext } from 'hooks/';

export const Theme: FC = ({ children }) => {
  const { theme } = useThemeContext();

  return <div data-theme={theme}>{children}</div>;
};
