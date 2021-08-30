import React from 'react';
import { MdClose } from 'react-icons/md';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './styles.scss';

export const PopupLogs = ({ logs, open, handleToggle }) => {
  const displayLogs = logs.map((log) => log);

  return (
    <div className={classNames('logs', { logs__active: open })} onClick={handleToggle}>
      <section className="logs__content" onClick={(e) => e.stopPropagation()}>
        <header className="logs__header">
          <h3 className="logs__title">Logs</h3>
          <MdClose className="logs__icon" onClick={handleToggle} />
        </header>
        <article className="logs__context">{displayLogs}</article>
      </section>
    </div>
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
