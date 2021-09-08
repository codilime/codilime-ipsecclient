import React, { FC, ReactNode } from 'react';
import classNames from 'classnames';
import './styles.scss';

interface IButton {
  children: ReactNode;
  onClick: () => void;
  className: string;
  btnDelete: boolean;
  disabled: boolean;
}

export const Button: FC<IButton> = ({ children, onClick, className, btnDelete, disabled }) => (
  <button {...{ onClick, disabled }} className={classNames('button', { [className]: className, button__delete: btnDelete, button__disabled: disabled })}>
    {children}
  </button>
);

interface IEndpointButton {
  onClick: () => void;
  secondary: boolean;
  children: ReactNode;
  disabled: boolean;
  className: string;
}

export const EndpointButton: FC<IEndpointButton> = ({ onClick, secondary, children, disabled, className }) => (
  <button
    {...{ onClick, disabled }}
    className={classNames('endpointButton', {
      [className]: className,
      endpointButton__secondary: secondary,
      endpointButton__disabled: disabled
    })}
    disabled={disabled}
  >
    {children}
  </button>
);
