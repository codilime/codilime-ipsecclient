import React, { FC } from 'react';

interface EachNotificationProps {
  time?: Date;
  description?: string;
}

export const EachNotification: FC<EachNotificationProps> = ({ time, description = 'notification description appears here' }) => {
  return (
    <div className="notification__each">
      <h4 className="notification__time">{time}</h4>
      <p className="notification__description">{description}</p>
    </div>
  );
};
