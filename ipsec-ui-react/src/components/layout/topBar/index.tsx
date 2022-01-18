import { useState, FC } from 'react';
import { MdDarkMode } from 'react-icons/md';
import Switch from 'react-switch';
import { Button } from 'common/';
import { Notification, Logout, Setting, PopupLogs } from 'template';
import { useThemeContext } from 'hooks/';
import { ThemeType } from 'interface/enum';
import './styles.scss';

export const TopBar: FC = () => {
  const { theme, setTheme } = useThemeContext();
  const [openPopup, setOpenPopup] = useState('');

  const handleOpenAction = (name: string) => {
    if (openPopup === '') return setOpenPopup(name);
    return setOpenPopup('');
  };

  return (
    <header className="topBar">
      <div className="topBar__left">
        <div className="topBar__switch">
          <Switch
            checked={theme === 'dark'}
            onChange={() => setTheme(theme === ThemeType.light ? ThemeType.dark : ThemeType.light)}
            onColor="#00abe7"
            onHandleColor="#00abe7"
            handleDiameter={20}
            uncheckedIcon={<MdDarkMode className="topBar__darkIcon" />}
            boxShadow="0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 1px 0px rgba(0, 0, 0, 0.14) "
            activeBoxShadow="0px 0px 1px 4px rgba(0, 0, 0, 0.2)"
            height={22}
            width={44}
          />
        </div>
        <Button className="topBar__log" onClick={() => handleOpenAction('logs')}>
          View logs
        </Button>
        <Notification {...{ open: openPopup === 'notice', handleToggle: () => handleOpenAction('notice') }} />
        <Setting {...{ open: openPopup === 'setting', handleToggle: () => handleOpenAction('setting') }} />
        <PopupLogs {...{ open: openPopup === 'logs', handleToggle: () => handleOpenAction('logs') }} />
      </div>
    </header>
  );
};
