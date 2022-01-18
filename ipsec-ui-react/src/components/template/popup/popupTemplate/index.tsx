import { FC } from 'react';
import { MdClose } from 'react-icons/md';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { Theme } from '../../../theme';
import './styles.scss';
interface PopupType {
  open: boolean;
  handleToggle: () => void;
  title: string;
}

export const Popup: FC<PopupType> = ({ open, handleToggle, title, children }) =>
  createPortal(
    <Theme>
      <div className={classNames('popup', { popup__active: open })} onClick={handleToggle}>
        <section className="popup__content" onClick={(e) => e.stopPropagation()}>
          <header className="popup__header">
            <h3 className="popup__title">{title}</h3>
            <MdClose className="popup__icon" onClick={handleToggle} />
          </header>
          <article className="popup__context">{children}</article>
        </section>
      </div>
    </Theme>,
    document.getElementById('root') as HTMLElement
  );
