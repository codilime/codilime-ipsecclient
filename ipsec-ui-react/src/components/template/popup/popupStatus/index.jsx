import React, { useEffect, useContext } from 'react';
import { useModalLogic } from 'hooks';
import classNames from 'classnames';
import { VrfsContext } from 'context';
import { Button } from 'common';
import './styles.scss';

export const PopupStatus = () => {
  const {
    vrf: { error }
  } = useContext(VrfsContext);

  const { stopPropagation, handleToggleModal, show } = useModalLogic();

  useEffect(() => {
    if (error) handleToggleModal();
  }, [error]);
  const errorStatus = error && error.error;

  return (
    <div className={classNames('status', { status__active: show })}>
      <div className={'status__content'} onClick={stopPropagation}>
        <div className={classNames('status__context', { status__context__error: error })}>
          <p className="status__description">{errorStatus}</p>
          <div className="status__buttons">
            <Button>Show more</Button>
            <Button btnDelete onClick={handleToggleModal}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
