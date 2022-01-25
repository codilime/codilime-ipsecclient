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
}

export const ToolTip: FC<TooltipType> = ({ children, open }) => <div className={classNames('toolTip', { toolTip__active: open })}>{children}</div>;
