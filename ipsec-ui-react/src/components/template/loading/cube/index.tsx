import { FC } from 'react';
import classNames from 'classnames';
import './styles.scss';

interface CubeType {
  loading: boolean;
}

export const Cube: FC<CubeType> = ({ loading }) => {
  return (
    <div className={classNames('loading', { loading__active: loading })}>
      <div className={classNames('cube')}>
        <div className="cube__container">
          <div className="cube__box">
            <div className="cube__half__first">
              <div className="cube__part cube__part__one"></div>
              <div className="cube__part cube__part__two"></div>
              <div className="cube__part cube__part__five"></div>
            </div>
            <div className="cube__half__second">
              <div className="cube__part cube__part__three"></div>
              <div className="cube__part cube__part__four"></div>
              <div className="cube__part cube__part__six"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
