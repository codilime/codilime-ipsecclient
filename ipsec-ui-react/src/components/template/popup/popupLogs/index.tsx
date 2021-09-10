import React, { FC } from 'react';
import { Popup } from 'template';
import { Button } from 'common/';
import { NotificationTypeProps } from '../../../../interface/components';

interface PopupLogsProps extends NotificationTypeProps {
  logs?: string[];
}

export const PopupLogs: FC<PopupLogsProps> = ({ logs = [], open, handleToggle }) => {
  const displayLogs = logs.map((log) => log);

  return (
    <Popup {...{ open, handleToggle, title: 'Logs' }}>
      <div>{displayLogs}</div>
      <div className="popup__footer">
        <Button name="" className="popup__save">
          Save
        </Button>
      </div>
    </Popup>
  );
};
