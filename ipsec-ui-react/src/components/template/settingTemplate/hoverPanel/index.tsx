import { FC } from 'react';
import { Button } from 'common/';
import { DescriptionType } from 'interface/index';
import classNames from 'classnames';
import './styles.scss';

interface HoverPanelType {
  active: boolean;
  description: DescriptionType;
  handleReset?: () => void;
  title?: string;
  button?: string;
  handleClose?: () => void;
}

export const HoverPanel: FC<HoverPanelType> = ({ description, title, button, active, handleReset, handleClose }) => {
  const { message, result } = description;

  const footer = button && (
    <div className="panel__footer">
      <Button {...{ className: 'panel__cancel', onClick: handleClose }}>Cancel</Button>
      <Button {...{ className: 'panel__btn', onClick: handleReset }}>{button}</Button>
    </div>
  );

  return (
    <div className={classNames('panel', { panel__active: active })}>
      <div
        className={classNames('panel__content', {
          panel__success: result === 'success',
          panel__error: result === 'error'
        })}
      >
        {title && <h3 className="panel__title">{title}</h3>}
        <span>{message}</span>
      </div>
      {footer}
    </div>
  );
};
