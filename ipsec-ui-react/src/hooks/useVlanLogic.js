import React, { useContext, useState, useEffect, useRef } from 'react';
import { VrfsContext } from 'context';

export const useVlanLogic = (setValue) => {
  const {
    vrf: { vlans, data }
  } = useContext(VrfsContext);

  const [vlan, setVlan] = useState(null);

  useEffect(() => {
    if (data.vlans) {
      setVlan(data.vlans);
    }
    setVlan([]);
  }, [data]);

  const select = useRef(null);

  const options = vlans.map((el) => (
    <option key={el.vlan} value={`${JSON.stringify(el)}`}>
      Vlan: {el.vlan} IP: {el.ip}
    </option>
  ));

  const handleAddNewVlan = () => {
    if (select.current) {
      const { value } = select.current;
      setVlan((prev) => [...prev, JSON.parse(value)]);
      setValue('vlans', [...vlan, JSON.parse(value)]);
    }
  };
  const handleDeleteVlan = (value) => {
    const newVlan = vlan.filter((el) => el.vlan !== value);
    setVlan(newVlan);
  };

  return { select, options, vlan, handleAddNewVlan, handleDeleteVlan };
};
