import { FC } from 'react';
import { vlanInterface } from 'interface/index';

interface EachVlanType extends vlanInterface {
  onClick: (vlan: number) => void;
}

export const EachVlan: FC<EachVlanType> = ({ vlan, lan_ip, onClick }) => (
  <tr className="vlan__row">
    <td className="vlan__column">{vlan}</td>
    <td className="vlan__column">{lan_ip}</td>
    <td className="vlan__cancel" onClick={() => onClick(vlan)}>
      Delete
    </td>
  </tr>
);
