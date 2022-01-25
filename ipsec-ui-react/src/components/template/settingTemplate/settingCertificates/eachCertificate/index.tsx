/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { ChangeEvent, FC } from 'react';
import { decodeX509 } from 'utils/';

interface EachCertificateType {
  id: number;
  ca_file: string;
  handleCheckCerts: (e: ChangeEvent<HTMLInputElement>, name: number) => void;
  checkedCa: { [key: string]: boolean };
}

export const EachCertificate: FC<EachCertificateType> = ({ id, ca_file, checkedCa, handleCheckCerts }) => {
  const decode = decodeX509(ca_file);
  return (
    <tr className="table__setting__row">
      <td className="table__setting__column">{decode.ON}</td>
      <td className="table__setting__column">{decode.CN}</td>
      <td className="table__setting__column table__setting__checked">
        <input {...{ type: 'checkbox', className: 'table__setting__checkbox', value: id || '', onChange: (e) => handleCheckCerts(e, id), checked: checkedCa[id] }} />
      </td>
    </tr>
  );
};
