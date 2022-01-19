import { FC, useState, useLayoutEffect } from 'react';
import { EachLog } from './eachLog';
import { HeadersLog } from './headersLog';
import { headerLogs } from 'db';
import { VrfsLogs } from './vrfsLogs';
import './styles.scss';
interface LogsType {
  logData: { log: string; name: string }[];
  open: boolean;
}

export const Logs: FC<LogsType> = ({ logData, open }) => {
  const [activePage, setActivePage] = useState<string>('api');

  const handleSetActivePage = (name: string) => setActivePage(name);

  useLayoutEffect(() => {
    const timeout = setTimeout(() => {
      if (!open) {
        setActivePage('api');
      }
    }, 500);
    return () => {
      clearTimeout(timeout);
    };
  }, [open]);

  const vrfsLogs: any[] = [];

  const DisplayLogData = logData.map(({ log, name }) => {
    switch (name) {
      case 'api':
      case 'front':
      case 'frr':
      case 'reload_vtysh':
      case 'strongswan':
      case 'strongswan_reload': {
        return <EachLog key={name} {...{ log, name, activePopup: open, active: activePage === name }} />;
      }

      default:
        vrfsLogs.push({ name, log });
        return;
    }
  });

  const displayVrfsLogs = <VrfsLogs {...{ vrfsLogs, activePage: activePage === 'vrfs' }} />;

  return (
    <article className="logs">
      <HeadersLog {...{ headerLogs, active: activePage, onClick: handleSetActivePage }} />
      {DisplayLogData}
      {displayVrfsLogs}
    </article>
  );
};
