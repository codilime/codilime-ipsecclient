import classNames from 'classnames';
import { Button, ScrollToBottom } from 'common/';
import { useLogsLogic } from 'hooks/';
import { FC, useState, useLayoutEffect } from 'react';
import { AiOutlineUpload } from 'react-icons/ai';
import { Field } from 'template';
import './styles.scss';

interface VrfsLogsType {
  vrfsLogs: { log: string; name: string }[];
  activePage: boolean;
}

export const VrfsLogs: FC<VrfsLogsType> = ({ vrfsLogs, activePage }) => {
  const { autoScroll, HandleDownloadTextFile, handleActioveScroll } = useLogsLogic();
  const [active, setActive] = useState<string>('');

  const vrfsLogList = vrfsLogs.map(({ name }) => (
    <li key={name} className={classNames('logsVrfs_item', { logsVrfs_item_active: active === name })} onClick={() => setActive(name)}>
      <span>VRF {name}</span>
    </li>
  ));

  const vrfsLogContext = vrfsLogs.map(({ name, log }) => (
    <div key={name} className={classNames('logsVrfs_context', { logsVrfs_active: active === name })}>
      {log}
    </div>
  ));

  useLayoutEffect(() => {
    if (vrfsLogs.length) setActive(vrfsLogs[0].name);
    const timeout = setTimeout(() => {
      if (vrfsLogs.length) setActive(vrfsLogs[0].name);
    }, 500);
    return () => {
      clearTimeout(timeout);
    };
  }, [activePage]);

  const exportCurrentVrf = vrfsLogs.find(({ name }) => name === active);

  return (
    <div className={classNames('logs__context', { logs__context__active: activePage })}>
      <div className="logs__panel">
        <aside className="logsVrfs_aside">
          <h4 className="logsVrfs_title">VRF's</h4>
          <ul className="logsVrfs_list">{vrfsLogList}</ul>
        </aside>
        {vrfsLogContext}
        <ScrollToBottom {...{ change: active, auto: autoScroll }} />
      </div>
      <div className="popup__footer">
        <Field {...{ type: 'checkbox', name: 'test', onChange: handleActioveScroll, checked: autoScroll, text: 'Auto Scroll', className: 'logs_btn' }} />
        <Button className="logs__save" onClick={() => HandleDownloadTextFile(exportCurrentVrf!.log, exportCurrentVrf!.name)}>
          export <AiOutlineUpload className="logs_icon" />
        </Button>
      </div>
    </div>
  );
};
