import { FC, useEffect } from 'react';
import { Button, ScrollToBottom } from 'common/';
import { Dotted } from 'template';
import { useToggle, useLogsLogic } from 'hooks/';
import classNames from 'classnames';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

interface EachLogType {
  title: string;
  activePopup: boolean;
}

export const EachLog: FC<EachLogType> = ({ title, activePopup }) => {
  const { open, handleToggle } = useToggle();

  const { logData, autoScroll, loading, handleFetchLogsData, HandleDownloadTextFile, handleActioveScroll } = useLogsLogic();

  useEffect(() => {
    if (open) {
      handleFetchLogsData(title);
    }
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

  const icon = open ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />;

  const active = autoScroll && '✓';

  return (
    <li className="logs__each">
      <h3 className={classNames('logs__title', { logs__title__active: open })} onClick={handleToggle}>
        {title} {icon}
      </h3>
      <div className={classNames('logs__context', { logs__context__active: open })}>
        <div className="logs__panel">
          <Dotted loading={loading} />
          <div className="logs__description">
            <p>{logData}</p>
          </div>
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
