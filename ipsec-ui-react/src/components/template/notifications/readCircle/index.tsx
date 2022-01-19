import { FC } from 'react';
import classNames from 'classnames';
import './styles.scss';

interface ReadCircleType {
  read: boolean;
}

export const ReadCircle: FC<ReadCircleType> = ({ read }) => {
  return <span className={classNames('readCircle', { ReadCircle__active: read })}></span>;
};
