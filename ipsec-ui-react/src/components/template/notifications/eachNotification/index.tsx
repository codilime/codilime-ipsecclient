import { FC } from 'react';

interface EachErrorType {
  id: number;
  message: string;
  errorTime: string;
}

export const EachNotification: FC<EachErrorType> = ({ errorTime, message }) => {
  return (
    <div className="notification__each">
      <h4 className="notification__time">{errorTime}</h4>
      <p className="notification__description">{message}</p>
    </div>
  );
};
