import { ScrollToBottom } from 'common/';
import { FC } from 'react';
import { Dotted } from 'template';

interface LogDataType {
  log: string;
  loading: boolean;
  autoScroll: boolean;
}

export const LogData: FC<LogDataType> = ({ loading, log, autoScroll }) => {
  return (
    <div className="logs__panel">
      <Dotted loading={loading} />
      <div className="logs__description">
        <p>{log}</p>
      </div>
      <ScrollToBottom {...{ change: log, auto: autoScroll }} />
    </div>
  );
};
