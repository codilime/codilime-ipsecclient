import React from 'react';
import { Wrapper, EachNotification } from 'template';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './styles.scss';

export const BoxNotification = ({ open, handleToggle, notifications }) => {
  const displayNotification = notifications.length ? notifications.map((notice) => <EachNotification {...notice} />) : <div className="notification__empty">There are no new notices</div>;

  return (
    <div className={classNames('notification', { notification__active: open })} onMouseLeave={handleToggle}>
      <Wrapper {...{ title: 'Unsaved changes', headerAction: 'Mark as read', className: 'notification__wrapper' }}>
        <div className="notification__centent">{displayNotification}</div>
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
  notifications: PropTypes.array
};
