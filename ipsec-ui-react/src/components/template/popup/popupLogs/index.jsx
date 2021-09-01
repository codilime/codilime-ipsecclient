import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'template';
import { Button } from 'common';

export const PopupLogs = ({ logs, open, handleToggle }) => {
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

PopupLogs.defaultProps = {
  logs: []
};

PopupLogs.propTypes = {
  open: PropTypes.bool,
  handleToggle: PropTypes.func,
  logs: PropTypes.array
};
