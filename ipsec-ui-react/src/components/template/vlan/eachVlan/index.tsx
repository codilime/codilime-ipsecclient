import { FC } from 'react';

interface EachVlanType {
  vlan: number;
  ip: string;
  onClick: (vlan: number) => void;
}

export const EachVlan: FC<EachVlanType> = ({ vlan, ip, onClick }) => (
  <tr className="vlan__row">
    <td className="vlan__column">{vlan}</td>
    <td className="vlan__column">{ip}</td>
    <td className="vlan__cancel" onClick={() => onClick(vlan)}>
      Delete
    </td>
  </tr>
);
