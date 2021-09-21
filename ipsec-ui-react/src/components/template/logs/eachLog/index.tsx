import { FC, useEffect } from 'react';
import { Button } from 'common/';
import { useToggle, useLogsLogic } from 'hooks/';
import classNames from 'classnames';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

interface EachLogType {
  title: string;
}

export const EachLog: FC<EachLogType> = ({ title }) => {
  const { open, handleToggle } = useToggle();
  const { displayData, handleFetchLogsData, HandleDownloadTextFile } = useLogsLogic();

  useEffect(() => {
    if (open) {
      handleFetchLogsData(title);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const interval = setInterval(() => {
        handleFetchLogsData(title);
      }, 2000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [open]);

  const icon = open ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />;
  return (
    <li className="logs__each">
      <h3 className={classNames('logs__title', { logs__title__active: open })} onClick={handleToggle}>
        {title} {icon}
      </h3>
      <div className={classNames('logs__context', { logs__context__active: open })}>
        <div className="logs__panel">
          <div className="logs__description">{displayData}</div>
        </div>
        <div className="popup__footer">
          <Button className="popup__save" onClick={() => HandleDownloadTextFile(title)}>
            Save
          </Button>
        </div>{' '}
      </div>
    </li>
  );
};
