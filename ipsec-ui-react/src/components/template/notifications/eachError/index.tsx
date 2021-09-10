import React, { FC } from 'react';

interface EachErrorProps {
  time?: Date;
  description?: string;
}

export const EachError: FC<EachErrorProps> = ({ time, description }) => {
  return (
    <div className="notifications__log">
      <p className="notifications__time">{time}</p>
      <p className="notifications__response notifications__error">{description}</p>
    </div>
  );
};
