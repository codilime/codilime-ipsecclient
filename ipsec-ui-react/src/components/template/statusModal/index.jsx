import React, { useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useModalLogic } from 'hooks';
import classNames from 'classnames';
import { VrfsContext } from 'context';
import './styles.scss';

export const StatusModal = ({ error, success, text }) => {
  const { setVrf } = useContext(VrfsContext);

  const { stopPropagation, handleToggleModal, show } = useModalLogic();

  useEffect(() => {
    if (error) handleToggleModal();
  }, [error]);

  useEffect(() => {
    if (show) {
      const timeOut = setTimeout(() => handleToggleModal(), 5000);
      return () => {
        clearTimeout(timeOut);
        setVrf((prev) => ({ ...prev, error: null, success: false }));
      };
    }
  }, [show]);

  const modalContent = text && text.error;

  return createPortal(
    <div className={classNames('status', { status__active: show })}>
      <div className={classNames('status__content')} onClick={stopPropagation}>
        <div className={classNames('status__context', { status__context__error: error, status__context__success: success })}>
          <p className="status__description">{modalContent}</p>
        </div>
      </div>
    </div>,
    document.getElementById('root')
  );
};

StatusModal.propTypes = {
  show: PropTypes.bool,
  header: PropTypes.string,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  handleToggleModal: PropTypes.func,
  error: PropTypes.any,
  success: PropTypes.bool
};
