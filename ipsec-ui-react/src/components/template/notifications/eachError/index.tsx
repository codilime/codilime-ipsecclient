import { FC } from 'react';

interface EachErrorType {
  id: number;
  message: string;
  errorTime: string;
}

export const EachError: FC<EachErrorType> = ({ errorTime, message }) => (
  <div className="notifications__log">
    <p className="notifications__time">{errorTime}</p>
    <p className="notifications__response notifications__error">{message}</p>
  </div>
);
