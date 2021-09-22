import { FC } from 'react';
import { EachLog } from './eachLog';
import './styles.scss';

interface LogsType {
  logList: string[];
  open: boolean;
}

export const Logs: FC<LogsType> = ({ logList, open }) => {
  const displayLogsList = logList.map((log) => <EachLog key={log} {...{ title: log, activePopup: open }} />);
  return (
    <article className="logs">
      <ul className="logs__list">{displayLogsList}</ul>
    </article>
  );
};
