import { ChangeEvent, FC } from 'react';
import { decodeX509 } from 'utils/';

interface EachCertificateType {
  ID: number;
  CA: string;
  handleCheckCerts: (e: ChangeEvent<HTMLInputElement>, name: number) => void;
}

export const EachCertificate: FC<EachCertificateType> = ({ ID, CA, handleCheckCerts }) => {
  const decode = decodeX509(CA);

  return (
    <tr className="table__row">
      <td className="table__setting__column">{decode.ON}</td>
      <td className="table__setting__column">{decode.CN}</td>
      <td className="table__setting__column table__setting__checked">
        <input {...{ type: 'checkbox', className: 'table__setting__checkbox', onChange: (e) => handleCheckCerts(e, ID) }} />
      </td>
    </tr>
  );
};
