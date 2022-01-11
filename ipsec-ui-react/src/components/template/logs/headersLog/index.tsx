import { FC } from 'react';
import classNames from 'classnames';
import { HeadersLogsType } from 'interface/index';

import './styles.scss';

interface HeaderLogType {
  active: string;
  headerLogs: HeadersLogsType[];
  onClick: (name: string) => void;
}

export const HeadersLog: FC<HeaderLogType> = ({ active, headerLogs, onClick }) => {
  const headers = headerLogs.map(({ name }) => (
    <li key={name} className={classNames('log_header', { log_active: active === name })} onClick={() => onClick(name)}>
      <span>{name}</span>
    </li>
  ));

  return (
    <header>
      <ul className="log_list">{headers}</ul>
    </header>
  );
};
