import { useState, FC } from 'react';
import Logo from 'images/Logo.png';
import { Button } from 'common/';
import { Notification, Logout, Setting, PopupLogs } from 'template';
import './styles.scss';

interface TopBarTypes {
  productName: string;
}

export const TopBar: FC<TopBarTypes> = ({ productName }) => {
  const [openPopup, setOpenPopup] = useState({ setting: false, notice: false, logs: false });

  const handleOpenAction = (name: string) => {
    switch (name) {
      case 'setting':
        return setOpenPopup((prev) => ({ setting: !prev.setting, notice: false, logs: false }));
      case 'logs':
        return setOpenPopup((prev) => ({ setting: false, notice: false, logs: !prev.logs }));
      default:
        return setOpenPopup((prev) => ({ notice: !prev.notice, setting: false, logs: false }));
    }
  };

  return (
    <header className="topBar">
      <div className="topBar__right">
        <img src={Logo} alt="cisco logo" className="topBar__image" />
        <p className="topBar__productName">{productName}</p>
      </div>
      <div className="topBar__left">
        <Button className="topBar__log" onClick={() => handleOpenAction('logs')}>
          View logs
        </Button>
        <Notification {...{ open: openPopup.notice, handleToggle: () => handleOpenAction('') }} />
        <Setting {...{ open: openPopup.setting, handleToggle: () => handleOpenAction('setting') }} />
        <Logout />
        <PopupLogs {...{ open: openPopup.logs, handleToggle: () => handleOpenAction('logs') }} />
      </div>
    </header>
  );
};
