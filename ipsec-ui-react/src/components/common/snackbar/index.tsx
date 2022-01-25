import { FC, useMemo, useEffect } from 'react';
import { IoAlertCircleOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import classNames from 'classnames';
import { useAppContext } from 'hooks/';
import './styles.scss';

enum SnackBarStatus {
  error = 'Error State',
  success = 'Success State'
}

export const SnackBar: FC = () => {
  const {
    context: { actionStatus },
    setContext
  } = useAppContext();
  const { error, success } = SnackBarStatus;

  const handleDeleteActionStatus = (index: number) => setContext((prev) => ({ ...prev, actionStatus: actionStatus.slice(index, index) }));

  useEffect(() => {
    if (actionStatus.length) {
      const interval = setInterval(() => {
        setContext((prev) => ({ ...prev, actionStatus: actionStatus.slice(1, -1) }));
      }, 5300);
      return () => {
        clearInterval(interval);
      };
    }
  }, [actionStatus]);

  const displayBars = useMemo(
    () =>
      actionStatus.map(({ status, message }, index) => (
        <li key={index} className={classNames('snackbar__item', { snackbar__error: status === error, snackbar__success: status === success })}>
          {status === error ? <IoAlertCircleOutline className="snackbar__icon" /> : <IoCheckmarkCircleOutline className="snackbar__icon" />} {message}
          <strong>{status}</strong>
        </li>
      )),
    [actionStatus]
  );

  return (
    <div className="snackbar">
      <ul className="snackbar__list">{displayBars}</ul>
    </div>
  );
};
