import React from 'react';

export const EachVlan = ({ vlan, ip, onClick }) => (
  <tr className="vlan__row">
    <td className="vlan__column">{vlan}</td>
    <td className="vlan__column">{ip}</td>
    <td className="vlan__cancel" onClick={() => onClick(vlan)}>
      Delete
    </td>
  </tr>
);
