/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */
import { FC } from 'react';
import { ButtonType } from 'interface/components';
import classNames from 'classnames';
import './styles.scss';

export const Button: FC<ButtonType> = ({ children, onClick, onSubmit, className = '', btnDelete, disabled, type = 'submit' }) => (
  <button {...{ onClick, disabled, onSubmit, type }} className={classNames('button', { [className]: className, button__delete: btnDelete, button__disabled: disabled })}>
    {children}
  </button>
);

interface SecondaryButtonType extends ButtonType {
  secondary?: boolean;
  table?: boolean;
  light?: boolean;
}

export const SecondaryButton: FC<SecondaryButtonType> = ({ onClick, secondary, table, light, children, disabled, className = '' }) => (
  <button
    {...{ onClick, disabled }}
    className={classNames('secondaryButton', {
      [className]: className,
      secondaryButton__secondary: secondary,
      secondaryButton__table: table,
      secondaryButton__light: light,
      secondaryButton__disabled: disabled
    })}
    disabled={disabled}
  >
    {children}
  </button>
);
