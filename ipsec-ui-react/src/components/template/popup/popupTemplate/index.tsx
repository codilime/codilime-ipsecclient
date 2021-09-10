import React, { FC } from 'react';
import { MdClose } from 'react-icons/md';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import './styles.scss';
import { NotificationTypeProps } from '../../../../interface/components';

interface PopupProps extends NotificationTypeProps {
  title: string;
}

export const Popup: FC<PopupProps> = ({ open, handleToggle, title, children }) => {
  return createPortal(
    <div className={classNames('popup', { popup__active: open })} onClick={handleToggle}>
      <section className="popup__content" onClick={(e) => e.stopPropagation()}>
        <header className="popup__header">
          <h3 className="popup__title">{title}</h3>
          <MdClose className="popup__icon" onClick={handleToggle} />
        </header>
        <article className="popup__context">{children}</article>
      </section>
    </div>,
    document.getElementById('root')
  );
};
