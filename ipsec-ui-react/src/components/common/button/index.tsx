import { FC } from 'react';
import { ButtonType } from 'interface/components';
import classNames from 'classnames';
import './styles.scss';

export const Button: FC<ButtonType> = ({ children, onClick, className = '', btnDelete, disabled }) => (
  <button {...{ onClick, disabled }} className={classNames('button', { [className]: className, button__delete: btnDelete, button__disabled: disabled })}>
    {children}
  </button>
);

interface EndpointButtonType extends ButtonType {
  secondary?: boolean;
}

export const EndpointButton: FC<EndpointButtonType> = ({ onClick, secondary, children, disabled, className = '' }) => (
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
