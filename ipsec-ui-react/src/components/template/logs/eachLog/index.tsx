import { FC, useEffect } from 'react';
import { Button, ScrollToBottom } from 'common/';
import { useToggle, useLogsLogic } from 'hooks/';
import classNames from 'classnames';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

interface EachLogType {
  title: string;
  activePopup: boolean;
}

export const EachLog: FC<EachLogType> = ({ title, activePopup }) => {
  const { open, handleToggle } = useToggle();

  const { logData, autoScroll, handleFetchLogsData, HandleDownloadTextFile, handleActioveScroll } = useLogsLogic();


  useEffect(() => {
    if (open) {
      handleFetchLogsData(title);
    }
  }, [open]);
  useEffect(() => {
    if (!activePopup && open) {
      handleToggle();
    }
  }, [activePopup]);

  useEffect(() => {
    if (open) {
      const interval = setInterval(() => {
        handleFetchLogsData(title);
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [open]);

  const displayData: any = logData.map((log, index) => {
    return <p key={index}>{log}</p>;
  });

  const icon = open ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />;

  const active = autoScroll && '✓';

  return (
    <li className="logs__each">
      <h3 className={classNames('logs__title', { logs__title__active: open })} onClick={handleToggle}>
        {title} {icon}
      </h3>
      <div className={classNames('logs__context', { logs__context__active: open })}>
        <div className="logs__panel">
          <div className="logs__description">{displayData}</div>
          <ScrollToBottom {...{ change: logData, auto: autoScroll }} />
        </div>
        <div className="popup__footer">
          <Button className="logs__auto" onClick={handleActioveScroll}>
            <span className="logs__char"> {active}</span> Auto scroll
          </Button>
          <Button className="logs__save" onClick={() => HandleDownloadTextFile(title)}>
            Save
          </Button>
        </div>
      </div>
    </li>
  );
};
