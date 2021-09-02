import React from 'react';
import { CircleInfo, TopSideIcon } from 'common';
import { BoxNotification, PopupNotification } from 'template';
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
        {/* <PopupNotification {...{ open: true }} /> */}
      </>
    </TopSideIcon>
  );
};

Notification.propTypes = {
  open: PropTypes.bool,
  handleToggle: PropTypes.func
};
