import { FC } from 'react';
import classNames from 'classnames';
import './styles.scss';

interface ReadCircleType {
  active?: boolean;
}

export const ReadCircle: FC<ReadCircleType> = ({ active }) => {
  return <span className={classNames('readCircle', { readCircle__active: active })}></span>;
};
