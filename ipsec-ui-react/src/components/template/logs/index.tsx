import { FC, useMemo } from 'react';
import { EachLog } from './eachLog';
import './styles.scss';

interface LogsType {
  logData: { log: string; name: string }[];
  open: boolean;
}

export const Logs: FC<LogsType> = ({ logData, open }) => {
  const displayLogsList = useMemo(() => logData.map(({ name, log }) => <EachLog key={log} {...{ log, title: name, activePopup: open }} />), [logData]);
  return (
    <article className="logs">
      <ul className="logs__list">{displayLogsList}</ul>
    </article>
  );
};
