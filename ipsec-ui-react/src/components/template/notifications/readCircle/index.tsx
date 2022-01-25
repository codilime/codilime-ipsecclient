/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import classNames from 'classnames';
import './styles.scss';

interface ReadCircleType {
  active?: boolean;
}

export const ReadCircle: FC<ReadCircleType> = ({ active }) => <span className={classNames('readCircle', { readCircle__active: active })}></span>;
