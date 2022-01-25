/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { useContext } from 'react';
import { ThemeContext } from 'context';

export const useThemeContext = () => {
  const ctxValue = useContext(ThemeContext);

  if (ctxValue === null) throw new Error('Expected context value to be set');

  return { ...ctxValue };
};
