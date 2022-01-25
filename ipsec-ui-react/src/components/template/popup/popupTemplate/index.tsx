/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

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
