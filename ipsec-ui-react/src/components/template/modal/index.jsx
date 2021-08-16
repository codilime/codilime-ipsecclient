import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useModalLogic } from 'hooks';
import { Button } from 'common';
import './styles.scss';

export const Modal = ({ show, header, children, btnDelete, leftButton, rightButton, handleToggleModal, handleDelete }) => {
  const { stopPropagation } = useModalLogic();

  return createPortal(
      <div className={`modal ${show ? 'modal--active' : ''}`} onClick={handleToggleModal}>
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
            <Button className="modal__btn" {...{ btnDelete }} onClick={handleDelete}>
              {rightButton}
            </Button>
          </div>
        </div>
      </div>,
      document.getElementById('root')
  );
};

Modal.propTypes = {
  show: PropTypes.bool,
  header: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  leftButton: PropTypes.string,
  rightButton: PropTypes.string,
  handleToggleModal: PropTypes.func,
  handleDelete: PropTypes.func,
  btnDelete: PropTypes.bool
};
