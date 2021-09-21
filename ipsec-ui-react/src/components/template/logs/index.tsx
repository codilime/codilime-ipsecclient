import { FC } from 'react';
import { EachLog } from './eachLog';
import './styles.scss';

interface LogsType {
  logList: string[];
}

export const Logs: FC<LogsType> = ({ logList }) => {
  const displayLogsList = logList.map((log) => <EachLog key={log} {...{ title: log }} />);
  return (
    <article className="logs">
      <ul className="logs__list">{displayLogsList}</ul>
    </article>
  );
};
