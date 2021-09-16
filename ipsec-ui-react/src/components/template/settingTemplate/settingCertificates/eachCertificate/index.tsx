import { ChangeEvent, FC } from 'react';

interface eachCertificateType {
  name: string;
  commonName: string;
  time: any;
  checked: boolean;
  handleCheckCerts: (e: ChangeEvent<HTMLInputElement>, name: string) => void;
}

export const EachCertificate: FC<eachCertificateType> = ({ name, commonName, time, checked, handleCheckCerts }) => {
  return (
    <tr className="table__row">
      <td className="table__setting__column">{name}</td>
      <td className="table__setting__column">{commonName}</td>
      <td className="table__setting__column table__setting__time">{time}</td>
      <td className="table__setting__column table__setting__checked">
        <input {...{ type: 'checkbox', className: 'table__setting__checkbox', checked, onChange: (e) => handleCheckCerts(e, name) }} />
      </td>
    </tr>
  );
};
