import React, { FC, MouseEvent } from 'react';

interface EachVlanProps {
  vlan: string;
  ip: string;
  onClick?: (e: MouseEvent<HTMLInputElement>) => void;
}

export const EachVlan: FC<EachVlanProps> = ({ vlan, ip, onClick }) => (
  <tr className="vlan__row">
    <td className="vlan__column">{vlan}</td>
    <td className="vlan__column">{ip}</td>
    <td className="vlan__cancel" onClick={() => onClick(vlan)}>
      Delete
    </td>
  </tr>
);
