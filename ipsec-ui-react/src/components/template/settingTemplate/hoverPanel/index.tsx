import { FC } from 'react';
import { Button } from 'common/';
import classNames from 'classnames';
import { descriptionType } from 'interface/index';

interface HoverPanelType {
  active: boolean;
  handleReset?: () => void;
  description: descriptionType;
  button?: string;
}

export const HoverPanel: FC<HoverPanelType> = ({ description, button, active, handleReset }) => {
  const { message, result } = description;

  const footer = button && (
    <div className="loginForm__panel__footer">
      <Button {...{ className: 'loginForm__btn', onClick: handleReset }}>{button}</Button>
    </div>
  );
  
  return (
    <div className={classNames('loginForm__panel', { loginForm__panel__active: active })}>
      <div
        className={classNames('loginForm__panel__content', {
          loginForm__panel__success: result === 'success',
          loginForm__panel__error: result === 'error'
        })}
      >
        <span>{message}</span>
      </div>
      {footer}
    </div>
  );
};