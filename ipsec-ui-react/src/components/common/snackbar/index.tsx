/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC, useMemo, useEffect } from 'react';
import { IoAlertCircleOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import { useAppContext } from 'hooks/';
import { SnackBarStatus } from 'interface/enum';
import classNames from 'classnames';
import './styles.scss';

export const SnackBar: FC = () => {
  const {
    context: { actionStatus },
    setContext
  } = useAppContext();
  const { error, success } = SnackBarStatus;

  useEffect(() => {
    if (actionStatus.length) {
      const interval = setInterval(() => {
        setContext((prev) => ({ ...prev, actionStatus: actionStatus.slice(1, -1) }));
      }, 5300);
      return () => {
        clearInterval(interval);
      };
    }
  }, [actionStatus]);

  const displayBars = useMemo(
    () =>
      actionStatus.map(({ status, message }, index) => (
        <li key={index} className={classNames('snackbar__item', { snackbar__error: status === error, snackbar__success: status === success })}>
          {status === error ? <IoAlertCircleOutline className="snackbar__icon" /> : <IoCheckmarkCircleOutline className="snackbar__icon" />} {message}
          <strong>{status}</strong>
        </li>
      )),
    [actionStatus]
  );

  return (
    <div className="snackbar">
      <ul className="snackbar__list">{displayBars}</ul>
    </div>
  );
};
