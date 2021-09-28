import { FC } from 'react';

interface eachNotificationType {
  time: string;
  description: string;
}

export const EachNotification: FC<eachNotificationType> = ({ time, description }) => {
  return (
    <div className="notification__each">
      <h4 className="notification__time">{time}</h4>
      <p className="notification__description">{description}</p>
    </div>
  );
};
