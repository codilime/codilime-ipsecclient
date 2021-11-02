import { FC, useEffect, useMemo } from 'react';
import { LogData } from '../logData';
import { Button } from 'common/';
import { useToggle, useLogsLogic } from 'hooks/';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import classNames from 'classnames';

interface EachLogType {
  title: string;
  log: string;
  activePopup: boolean;
}

export const EachLog: FC<EachLogType> = ({ title, activePopup, log }) => {
  const { open, handleToggle } = useToggle();

  const { autoScroll, loading, HandleDownloadTextFile, handleActioveScroll } = useLogsLogic();

  useEffect(() => {
    if (!open && autoScroll) {
      handleActioveScroll();
    }
  }, [open]);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      if (!activePopup && open) {
        handleToggle();
      }
    }, 200);
    return () => {
      clearTimeout(timeOut);
    };
  }, [activePopup]);

  const icon = open ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />;

  const active = autoScroll && '✓';

  const logHeader = useMemo(
    () => (
      <h3 className={classNames('logs__title', { logs__title__active: open })} onClick={handleToggle}>
        {title} {icon}
      </h3>
    ),
    [title]
  );

  const logs = useMemo(() => <LogData {...{ log, loading, autoScroll }} />, [log]);
  console.log('render');
  
  return (
    <li className="logs__each">
      {logHeader}
      <div className={classNames('logs__context', { logs__context__active: open })}>
        {logs}
        <div className="popup__footer">
          <Button className="logs__auto" onClick={handleActioveScroll}>
            <span className="logs__char"> {active}</span> Auto scroll
          </Button>
          <Button className="logs__save" onClick={() => HandleDownloadTextFile(log, title)}>
            Save
          </Button>
        </div>
      </div>
    </li>
  );
};
