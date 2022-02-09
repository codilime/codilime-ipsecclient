/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC, useState } from 'react';
import { ToolTip } from 'common/';

interface EachErrorType {
  id: number;
  message: string;
  time: string;
}

export const EachError: FC<EachErrorType> = ({ time, message }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="notifications__log">
      <p className="notifications__time">{time.split('+0000')[0]}</p>
      <p
        className="notifications__response notifications__error"
        {...{
          onMouseMove: () => setShow(true),
          onMouseLeave: () => setShow(false)
        }}
      >
        {message}
      </p>
      <ToolTip {...{ open: show, className: 'notifications__tooltip' }}>{message}</ToolTip>
    </div>
  );
};
