import React, { FC } from 'react';

interface IEachCertificate {
  name: string;
  commonName: string;
  time: Date;
  checked: boolean;
  onChange: () => void;
}

export const EachCertificate: FC<IEachCertificate> = ({ name, commonName, time, checked, onChange }) => {
  return (
    <tr className="table__row">
      <td className="table__setting__column">{name}</td>
      <td className="table__setting__column">{commonName}</td>
      <td className="table__setting__column table__setting__time">{time}</td>
      <td className="table__setting__column table__setting__checked">
        <input {...{ type: 'checkbox', checked, onChange }} />
      </td>
    </tr>
  );
};
