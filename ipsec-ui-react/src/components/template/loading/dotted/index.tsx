/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import classNames from 'classnames';
import './styles.scss';

interface LoadingType {
  loading: boolean;
}

export const Dotted: FC<LoadingType> = ({ loading }) => (
  <div className={classNames('dotted__loading', { dotted__loading__active: loading })}>
    <div className="dotted"></div>
  </div>
);