import { useState, FC } from 'react';
import { Button } from 'common/';
import { Notification, Logout, Setting, PopupLogs } from 'template';
import { useThemeContext } from 'hooks/';
import { Theme } from '../../../appTheme';
import './styles.scss';

export const TopBar: FC = () => {
  const [openPopup, setOpenPopup] = useState('');

  const handleOpenAction = (name: string) => {
    if (openPopup === '') return setOpenPopup(name);
    return setOpenPopup('');
  };

  return (
    <header className="topBar">
      <div className="topBar__left">
        <Button className="topBar__log" onClick={() => handleOpenAction('logs')}>
          View logs
        </Button>
        {/* <Notification {...{ open: openPopup === 'notice', handleToggle: () => handleOpenAction('notice') }} /> */}
        <Setting {...{ open: openPopup === 'setting', handleToggle: () => handleOpenAction('setting') }} />
        <PopupLogs {...{ open: openPopup === 'logs', handleToggle: () => handleOpenAction('logs') }} />
      </div>
    </header>
  );
};
