import React, { useEffect } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { BiInfoCircle } from 'react-icons/bi';
import { useToggle } from 'hooks';
import './styles.scss';

export const ToolTipInfo = ({ children, error }) => {
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

ToolTipInfo.propTypes = {
  children: PropTypes.any,
  error: PropTypes.object
};
