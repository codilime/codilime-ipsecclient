import React, { FC, MouseEvent } from 'react';
import classNames from 'classnames';
import './styles.scss';
import { ButtonTypeProps } from '../../../interface/components';

interface ButtonProps extends ButtonTypeProps {
  btnDelete?: boolean;
}

export const Button: FC<ButtonProps> = ({ children, onClick, className = '', btnDelete, disabled }) => (
  <button {...{ onClick, disabled }} className={classNames('button', { [className]: className, button__delete: btnDelete, button__disabled: disabled })}>
    {children}
  </button>
);

interface EndpointButtonProps extends ButtonTypeProps {
  secondary?: boolean;
}

export const EndpointButton: FC<EndpointButtonProps> = ({ onClick, secondary, children, disabled, className = '' }) => (
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
