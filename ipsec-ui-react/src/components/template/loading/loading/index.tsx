/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import classNames from 'classnames';
import { FC } from 'react';
import './styles.scss';

interface LoadingType {
  loading: boolean;
}

export const Loading: FC<LoadingType> = ({ loading }) => (
  <div className={classNames('loading__background', { loading__background__active: loading })}>
    <div className="loading__inside">
      <div className="loading__part"></div>
      <div className="loading__part__two"></div>
      <div className="loading__part__three">ic</div>
    </div>
  </div>
);
