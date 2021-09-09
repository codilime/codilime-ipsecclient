import React, { FC, ReactNode } from 'react';
import classNames from 'classnames';
import './styles.scss';

interface IWrapper {
  title: string;
  references: any;
  className: string;
  headerAction: string;
  onClick: () => void;
  children: ReactNode;
  small: boolean;
}
export const Wrapper: FC<IWrapper> = ({ title, children, className, references, headerAction, onClick, small }) => {
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
