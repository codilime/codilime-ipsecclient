import React, { FunctionComponent } from 'react';
import classNames from 'classnames';
import './styles.scss';

// TODO - type HOC
interface SpinnerProps {
  loading?: boolean;
}
export const Spinner: FunctionComponent<SpinnerProps> = ({ loading }) => {
  const spinner = Array.from({ length: 19 }).map((_, index) => (
    <div className="spinner__container" style={{ transform: `rotate(calc(18deg * ${index + 1}))` }} key={index}>
      <span className={classNames('spinner__cirlce', { spinner__cirlce__active: loading })} style={{ animationDelay: `calc(0.1s*${index + 1})` }}></span>
    </div>
  ));
  return (
    <div className={classNames('loading', { loading__active: loading })}>
      <div className="spinner">{spinner}</div>
    </div>
  );
};
