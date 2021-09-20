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

  const HandleDownloadTextFile = () => {
    const element = document.createElement('a');
    const file = new Blob(['hello test pliku tekstowego'], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'NewDocument.txt';
    document.body.appendChild(element);
    element.click();
  };

  return (
    <Popup {...{ open, handleToggle, title: 'Logs' }}>
      <div>{displayLogs}</div>
      <div className="popup__footer">
        <Button className="popup__save" onClick={HandleDownloadTextFile}>
          Save
        </Button>
      </div>
    </Popup>
  );
};
