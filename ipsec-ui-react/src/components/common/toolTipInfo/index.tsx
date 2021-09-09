import React, { FC, useEffect } from 'react';
import classNames from 'classnames';
import { BiInfoCircle } from 'react-icons/bi';
import { useToggle } from 'hooks';
import './styles.scss';

interface ToolTipInfoProps {
  error: any;
}

export const ToolTipInfo: FC<ToolTipInfoProps> = ({ children, error }) => {
  const { open, handleToggle } = useToggle();

  useEffect(() => {
    if (error) handleToggle();
  }, [error]);

  return (
    <>
      <BiInfoCircle className="table__icon" onClick={handleToggle} />
      <div className={classNames('toolTipInfo', { toolTipInfo__active: open })} onMouseLeave={handleToggle}>
        <div className="toolTipInfo__label">{children}</div>
      </div>
    </>
  );
};
