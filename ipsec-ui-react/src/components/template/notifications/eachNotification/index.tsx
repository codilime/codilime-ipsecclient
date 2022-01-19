import { FC } from 'react';
import { ReadCircle } from 'template';
import './styles.scss';

interface EachErrorType {
  id: number;
  message: string;
  errorTime: string;
}

export const EachNotification: FC<EachErrorType> = ({ errorTime, message }) => {
  return (
    <div className="each">
      <h4 className="each__time">
        <ReadCircle read />
        {errorTime}
      </h4>
      <p className="each__description">{message}</p>
    </div>
  );
};
