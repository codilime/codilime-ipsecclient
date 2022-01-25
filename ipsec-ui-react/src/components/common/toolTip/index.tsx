/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { useEffect, FC } from 'react';
import { BiInfoCircle } from 'react-icons/bi';
import { useToggle } from 'hooks/';
import classNames from 'classnames';
import './styles.scss';

interface ToolTipInfoType {
  error?: any;
}

export const ToolTipInfo: FC<ToolTipInfoType> = ({ children, error }) => {
  const { open, handleToggle } = useToggle();

  useEffect(() => {
    if (error) handleToggle();
  }, [error]);

  return (
    <>
      <BiInfoCircle className="table__icon" onClick={handleToggle} />
      <div className={classNames('toolTipInfo', { toolTipInfo__active: open })} onMouseLeave={handleToggle}>
        {children}
      </div>
    </>
  );
};

interface TooltipType {
  open: boolean;
  className?: string;
}

export const ToolTip: FC<TooltipType> = ({ children, open, className = '' }) => <div className={classNames('toolTip', { toolTip__active: open, [className]: className })}>{children}</div>;
