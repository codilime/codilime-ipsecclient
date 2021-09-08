import React, { FC, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useModalLogic } from 'hooks';
import { Button } from 'common';
import classNames from 'classnames';
import './styles.scss';

interface IModal {
  show: boolean;
  header: PropTypes.string;
  children: ReactNode;
  leftButton: string;
  rightButton: string;
  handleToggleModal: () => void;
  handleDelete: () => void;
  btnDelete: boolean;
}

export const Modal: FC<IModal> = ({ show, header, children, btnDelete, leftButton, rightButton, handleToggleModal, handleDelete }) => {
  const { stopPropagation } = useModalLogic();

  return createPortal(
    <div className={classNames('modal', { modal__active: show })} onClick={handleToggleModal}>
      <div className="modal__content" onClick={stopPropagation}>
        <div className="modal__header">
          <h4 className="modal__title">{header}</h4>
        </div>
        <div className="modal__context">
          <p className="modal__description">{children}</p>
        </div>
        <div className="modal__footer">
          <Button className="modal__btn" onClick={handleToggleModal}>
            {leftButton}
          </Button>
          <Button
            className="modal__btn"
            {...{
              btnDelete,
              onClick: () => {
                handleDelete(), handleToggleModal();
              }
            }}
          >
            {rightButton}
          </Button>
        </div>
      </div>
    </div>,
    document.getElementById('root')
  );
};
