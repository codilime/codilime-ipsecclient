import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'template';

export const PopupLogs = ({ logs, open, handleToggle }) => {
  const displayLogs = logs.map((log) => log);

  return <Popup {...{ open, handleToggle, title: 'Logs' }}>{displayLogs}</Popup>;
};

PopupLogs.defaultProps = {
  logs: []
};

PopupLogs.propTypes = {
  open: PropTypes.bool,
  handleToggle: PropTypes.func,
  logs: PropTypes.array
};
