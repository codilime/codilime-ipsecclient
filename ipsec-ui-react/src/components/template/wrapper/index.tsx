/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC, Ref } from 'react';
import classNames from 'classnames';
import './styles.scss';

interface WrapperType {
  title: string;
  className?: string;
  wrapperClass?: string;
  references?: Ref<HTMLDivElement>;
  headerAction?: string;
  onClick?: () => void;
  small?: boolean;
}

export const Wrapper: FC<WrapperType> = ({ title, children, className = '', wrapperClass = '', references, headerAction, onClick, small }) => {
  const headerActionBtn = headerAction && (
    <button className="wrapper__btn" {...{ onClick }}>
      {headerAction}
    </button>
  );

  return (
    <div className={classNames('wrapper', { wrapper__small: small, [wrapperClass]: wrapperClass })}>
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
