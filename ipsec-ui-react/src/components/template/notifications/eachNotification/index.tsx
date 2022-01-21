import classNames from 'classnames';
import { FC } from 'react';
import { ReadCircle } from 'template';
import './styles.scss';

interface EachErrorType {
  id: number;
  message: string;
  time: string;
  active?: boolean;
  onClick?: () => void;
}

export const EachNotification: FC<EachErrorType> = ({ time, message, active, onClick }) => {
  return (
    <div className={classNames('each', { each__active: active })} {...{ onClick }}>
      <h4 className="each__time">
        <ReadCircle {...{ active }} />
        {time.split(':01 +0000')[0]}
      </h4>
      <p className="each__description">{message}</p>
    </div>
  );
};
