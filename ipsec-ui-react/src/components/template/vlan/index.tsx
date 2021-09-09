import React from 'react';
import { Wrapper } from 'template';
import { useVlanLogic } from 'hooks';
import { EachVlan } from './eachVlan';
import './styles.scss';

export const Vlan = ({ setValue }) => {
  const { options, select, vlan, handleAddNewVlan, handleDeleteVlan } = useVlanLogic(setValue);
  console.log(vlan);
  const displayVlans =
    vlan === null || !vlan.length ? (
      <tr className="vlan__row__empty">
        <td>Add Vlans from dropdown</td>
      </tr>
    ) : (
      vlan.map((el) => <EachVlan {...{ ...el, onClick: handleDeleteVlan }} />)
    );

  return (
    <div className="vlan">
      <Wrapper {...{ title: 'Attached L3 Vlan interfaces', small: true }}>
        <div className="vlan__header">
          <div className="vlan__select__box">
            <select className="vlan__select" ref={select} defaultValue="Select Vlan">
              <option value="Select Vlan" hidden>
                Select Vlan
              </option>
              {options}
            </select>
          </div>
          <p className="vlan__btn" onClick={handleAddNewVlan}>
            Add
          </p>
        </div>
        <div>
          <table className="vlan__table">
            <thead className="vlan__head">
              <tr className="vlan__row vlan__row__header">
                <th>VLAN</th>
                <th>IP/MASK</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="vlan__body">{displayVlans}</tbody>
          </table>
        </div>
      </Wrapper>
    </div>
  );
};
