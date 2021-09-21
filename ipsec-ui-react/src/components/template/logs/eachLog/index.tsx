import { FC, useState, useEffect } from 'react';
import { Button } from 'common/';
import { useToggle, useLogsLogic } from 'hooks/';
import classNames from 'classnames';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

interface EachLogType {
  title: string;
}

export const EachLog: FC<EachLogType> = ({ title }) => {
  const { open, handleToggle } = useToggle();
  const { logData, handleFetchLogsData } = useLogsLogic();

  useEffect(() => {
    if (open) {
      handleFetchLogsData(title);
    }
  }, [open]);
  useEffect(() => {
    if (open) {
      const interval = setInterval(() => {
        handleFetchLogsData(title);
      }, 5000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [open]);

  const HandleDownloadTextFile = () => {
    const element = document.createElement('a');
    const file = new Blob([logData], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${title}.txt`;
    document.body.appendChild(element);
    element.click();
  };
  const icon = open ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />;
  return (
    <li className="logs__each">
      <h3 className={classNames('logs__title', { logs__title__active: open })} onClick={handleToggle}>
        {title} {icon}
      </h3>
      <div className={classNames('logs__context', { logs__context__active: open })}>
        <div className="logs__panel">
          <div className="logs__description">{logData}</div>
        </div>
        <div className="popup__footer">
          <Button className="popup__save" onClick={HandleDownloadTextFile}>
            Save
          </Button>
        </div>{' '}
      </div>
    </li>
  );
};
