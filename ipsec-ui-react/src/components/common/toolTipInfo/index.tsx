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
        <div className="toolTipInfo__label">{children}</div>
      </div>
    </>
  );
};
