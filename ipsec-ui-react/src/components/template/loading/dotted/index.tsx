import { FC } from 'react';
import classNames from 'classnames';
import './styles.scss';

interface LoadingType {
  loading: boolean;
}

export const Dotted: FC<LoadingType> = ({ loading }) => (
  <div className={classNames('dotted__loading', { dotted__loading__active: loading })}>
    <div className="dotted"></div>
  </div>
);