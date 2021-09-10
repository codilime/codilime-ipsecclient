import { FC } from 'react';
import { Popup } from 'template';
import { Button } from 'common/';

interface PopupLogsType {
  logs?: Array<any>;
  open: boolean;
  handleToggle: () => void;
}

export const PopupLogs: FC<PopupLogsType> = ({ logs = [], open, handleToggle }) => {
  const displayLogs = logs.map((log) => log);

  return (
    <Popup {...{ open, handleToggle, title: 'Logs' }}>
      <div>{displayLogs}</div>
      <div className="popup__footer">
        <Button className="popup__save">Save</Button>
      </div>
    </Popup>
  );
};
