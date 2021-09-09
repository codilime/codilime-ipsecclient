import React, { FC, ChangeEvent } from 'react';

interface EachCertificateProps {
  name: string;
  commonName: string;
  time: Date;
  checked: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const EachCertificate: FC<EachCertificateProps> = ({ name, commonName, time, checked, onChange }) => {
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
