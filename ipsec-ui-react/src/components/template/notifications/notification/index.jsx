import React from 'react';
import { CircleInfo, TopSideIcon } from 'common';
import { BoxNotification } from 'template';
import { FiBell } from 'react-icons/fi';
import PropTypes from 'prop-types';

export const Notification = ({ open, handleToggle }) => {
  const notifications = [];

  const newNotification = notifications.length ? <CircleInfo /> : null;

  return (
    <TopSideIcon>
      <>
        <FiBell className="topBar__icon" onClick={handleToggle} />
        {newNotification}
        <BoxNotification {...{ open, handleToggle, notifications }} />
      </>
    </TopSideIcon>
  );
};

Notification.propTypes = {
  open: PropTypes.bool,
  handleToggle: PropTypes.func
};
