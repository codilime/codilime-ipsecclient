/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';

interface EachErrorType {
  id: number;
  message: string;
  time: string;
}

export const EachError: FC<EachErrorType> = ({ time, message }) => (
  <div className="notifications__log">
    <p className="notifications__time">{time.split(':01')[0]}</p>
    <p className="notifications__response notifications__error">{message}</p>
  </div>
);
