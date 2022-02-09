/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { ReadCircle } from 'template';
import classNames from 'classnames';

import './styles.scss';
interface EachErrorType {
  id: number;
  message: string;
  time: string;
  active?: boolean;
  onClick?: () => void;
}

export const EachNotification: FC<EachErrorType> = ({ time, message, active, onClick }) => (
  <div className={classNames('each', { each__active: active })} {...{ onClick }}>
    <h4 className="each__time">
      <ReadCircle {...{ active }} />
      {time.split('+0000')[0]}
    </h4>
    <p className="each__description">{message}</p>
  </div>
);
