/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC, useEffect } from 'react';
import { useModalLogic, useAppContext } from 'hooks/';
import { Button } from 'common/';
import classNames from 'classnames';
import './styles.scss';

export const PopupStatus: FC = () => {
  const {
    context: { error }
  } = useAppContext();

  const { stopPropagation, handleToggleModal, show } = useModalLogic();

  useEffect(() => {
    if (error) handleToggleModal();
  }, [error]);

  return (
    <div className={classNames('status', { status__active: show })}>
      <div className={'status__content'} onClick={stopPropagation}>
        <div className={classNames('status__context', { status__context__error: error })}>
          <p className="status__description">{error && error.error}</p>
          <div className="status__buttons">
            <Button btnDelete onClick={handleToggleModal}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
