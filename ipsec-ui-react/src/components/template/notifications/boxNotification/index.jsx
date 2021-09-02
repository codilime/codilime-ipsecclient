import React from 'react';
import { Wrapper, EachNotification } from 'template';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './styles.scss';

export const BoxNotification = ({ open, handleToggle, notifications, handleOpenLogs }) => {
  const displayNotification = notifications.length ? (
    notifications.map((notice, index) => <EachNotification key={index} {...notice} />)
  ) : (
    <div className="notification__empty">There are no new notices</div>
  );

  return (
    <div className={classNames('notification', { notification__active: open })} onMouseLeave={handleToggle}>
      <Wrapper {...{ title: 'Unsaved changes', headerAction: 'Show all logs', small: true, onClick: handleOpenLogs }}>
        <div className="notification__content">{displayNotification}</div>
      </Wrapper>
    </div>
  );
};

BoxNotification.defaultProps = {
  notifications: []
};

BoxNotification.propTypes = {
  open: PropTypes.bool,
  handleToggle: PropTypes.func,
  handleOpenLogs: PropTypes.func,
  notifications: PropTypes.array
};
