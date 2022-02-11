/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { HeadersLogsType } from 'interface/index';
import classNames from 'classnames';
import './styles.scss';

interface HeaderLogType {
  active: string;
  headerLogs: HeadersLogsType[];
  onClick: (name: string) => void;
}

export const HeadersLog: FC<HeaderLogType> = ({ active, headerLogs, onClick }) => {
  const headers = headerLogs.map(({ name, value }) => (
    <li key={name} className={classNames('log__header', { log__active: active === value })} onClick={() => onClick(value)}>
      <span>{name}</span>
    </li>
  ));

  return (
    <header>
      <ul className="log__list">{headers}</ul>
    </header>
  );
};
