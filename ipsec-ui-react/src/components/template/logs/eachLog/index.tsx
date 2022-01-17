import { FC } from 'react';
import { AiOutlineUpload } from 'react-icons/ai';
import { LogData } from '../logData';
import { Button } from 'common/';
import { useLogsLogic } from 'hooks/';
import classNames from 'classnames';
import { Field } from 'template';

interface EachLogType {
  name: string;
  log: string;
  active: boolean;
}

export const EachLog: FC<EachLogType> = ({ name, log, active }) => {
  const { autoScroll, loading, HandleDownloadTextFile, handleActioveScroll } = useLogsLogic();

  return (
    <div className={classNames('logs__context', { logs__context__active: active })}>
      {<LogData {...{ log, loading, autoScroll }} />}
      <div className="popup__footer">
        <Field {...{ type: 'checkbox', name, onChange: handleActioveScroll, checked: autoScroll, text: 'Auto Scroll', className: 'logs_btn' }} />
        <Button className="logs__save" onClick={() => HandleDownloadTextFile(log, name)}>
          export <AiOutlineUpload className="logs_icon" />
        </Button>
      </div>
    </div>
  );
};
