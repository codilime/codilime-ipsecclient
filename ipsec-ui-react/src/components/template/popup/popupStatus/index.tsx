import { FC, useEffect } from 'react';
import { useModalLogic, useAppContext } from 'hooks/';
import classNames from 'classnames';
import { Button } from 'common/';
import './styles.scss';

export const PopupStatus: FC = () => {
  const {
    vrf: { error }
  } = useAppContext();

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
            <Button btnDelete onClick={handleToggleModal}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
