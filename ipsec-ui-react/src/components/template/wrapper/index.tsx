import React, { Ref, MouseEvent, FC } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './styles.scss';

interface WrapperProps {
  title: string;
  references?: Ref<HTMLDivElement>;
  className?: string;
  headerAction?: string;
  onClick?: (e: MouseEvent<HTMLInputElement>) => void;
  small?: boolean;
}

export const Wrapper: FC<WrapperProps> = ({ title, children, className, references, headerAction, onClick, small }) => {
  const headerActionBtn = headerAction && (
    <button className="wrapper__btn" {...{ onClick }}>
      {headerAction}
    </button>
  );

  return (
    <div className={classNames('wrapper', { wrapper__small: small })}>
      <div className="wrapper__header">
        <h3 className="wrapper__title">{title}</h3>
        {headerActionBtn}
      </div>
      <div className={classNames('wrapper__content', { [className]: className })} ref={references}>
        {children}
      </div>
    </div>
  );
};

Wrapper.propTypes = {
  title: PropTypes.string.isRequired,
  references: PropTypes.any,
  className: PropTypes.string,
  headerAction: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  small: PropTypes.bool
};
