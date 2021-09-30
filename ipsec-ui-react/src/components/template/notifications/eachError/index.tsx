import { FC } from 'react';

interface eachErrorType {
  time: string;
  description: string;
}

export const EachError: FC<eachErrorType> = ({ time, description }) => {
  return (
    <div className="notifications__log">
      <p className="notifications__time">{time}</p>
      <p className="notifications__response notifications__error">{description}</p>
    </div>
  );
};
