import React, { FC } from 'react';
import { Popup } from 'template';
import { Button } from 'common';

interface IPopupLogs {
  open: boolean;
  handleToggle: () => void;
  logs: Array<string>;
}

export const PopupLogs: FC<IPopupLogs> = ({ logs = [], open, handleToggle }) => {
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
