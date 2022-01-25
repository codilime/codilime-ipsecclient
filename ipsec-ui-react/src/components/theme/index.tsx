/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { useThemeContext } from 'hooks/';

export const Theme: FC = ({ children }) => {
  const { theme } = useThemeContext();

  return <div data-theme={theme}>{children}</div>;
};
