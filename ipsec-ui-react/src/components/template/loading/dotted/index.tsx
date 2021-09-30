import { FC } from 'react';
import classNames from 'classnames';
import './styles.scss';

interface loadingType {
  loading: boolean;
}

export const Dotted: FC<loadingType> = ({ loading }) => {
  return (
    <div className={classNames('dotted__loading', { dotted__loading__active: loading })}>
      <div className="dotted"></div>
    </div>
  );
};
