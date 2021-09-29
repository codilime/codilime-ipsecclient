import { FC } from 'react';
import { Button } from 'common/';
import classNames from 'classnames';
import { descriptionType } from 'interface/index';

interface HoverPanelType {
  active: boolean;
  handleReset: () => void;
  description: descriptionType;
  button: string;
}

export const HoverPanel: FC<HoverPanelType> = ({ description, button, active, handleReset }) => {
  const { message, result } = description;
  return (
    <div className={classNames('loginForm__panel', { loginForm__panel__active: active })}>
      <div className={classNames('loginForm__panel__content', { 
          loginForm__panel__success: result === 'success', 
          loginForm__panel__error: result === 'error' 
          })}>
        <span>{description.message}</span>
      </div>
      <div className="loginForm__panel__footer">
        <Button {...{ className: 'loginForm__btn', onClick: handleReset }}>{button}</Button>
      </div>
    </div>
  );
};
