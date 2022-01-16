import { FC } from 'react';
import { VlanInterface } from 'interface/index';
import { RiDeleteBin7Line } from 'react-icons/ri';

interface EachVlanType extends VlanInterface {
  onClick: () => void;
}

export const EachVlan: FC<EachVlanType> = ({ vlan, lan_ip, onClick }) => (
  <tr className="vlan__row">
    <td className="vlan__column">{vlan}</td>
    <td className="vlan__column">{lan_ip}</td>
    <td>
      <RiDeleteBin7Line className="vlan__cancel" {...{ onClick }} />
    </td>
  </tr>
);
