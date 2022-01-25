/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { useContext } from 'react';
import { VrfsContext } from 'context';

export const useAppContext = () => {
  const ctxValue = useContext(VrfsContext);

  if (ctxValue === null) throw new Error('Expected context value to be set');

  return { ...ctxValue };
};
