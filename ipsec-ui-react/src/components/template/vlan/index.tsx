import { FC } from 'react';
import { useVlanLogic } from 'hooks/';
import { EachVlan } from './eachVlan';
import { VlanInput } from './vlanInput';
import { Control } from 'react-hook-form';

import './styles.scss';
import { VrfDataTypes } from 'interface/index';

interface VlanType {
  control: Control<VrfDataTypes>;
  errorSchema?: any;
}

export const Vlan: FC<VlanType> = ({ errorSchema, control }) => {
  const { fields, error, vlanInterface, handleAddNewVlan, handleDeleteVlan, handleChangeInputValue } = useVlanLogic(control);

  const errorMessage = errorSchema ? <p className="vlan__cancel">{errorSchema.message}</p> : 'There are no active Vlan and no Lan IP Mask';

  const displayVlans = !fields.length ? (
    <tr className="vlan__row__empty">
      <td>{errorMessage}</td>
    </tr>
  ) : (
    fields.map((el, index) => <EachVlan key={el.vlan} {...{ ...el, onClick: () => handleDeleteVlan(index) }} />)
  );

  return (
    <div className="vlan">
      <div className="vlan__wrapper">
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
        <div className="vlan__box">
          <VlanInput
            {...{
              placeholder:'Vlan',
              name: 'vlan',
              type: 'number',
              onChange: handleChangeInputValue,
              value: vlanInterface.vlan || '',
              error,
              min: '0',
              tooltip: 'VLAN number (1-4094) that will be terminated inside APP'
            }}
          />
          <VlanInput
            {...{
              name: 'lan_ip',
              placeholder: 'Lan IP',
              onChange: handleChangeInputValue,
              value: vlanInterface.lan_ip,
              error,
              tooltip: 'Local address (IPv4/IPv6) and mask for VLAN interface inside application (i.e 10.0.0.1/24 or fc00::c0d1:1/64)'
            }}
          />
          <p className="vlan__btn" onClick={handleAddNewVlan}>
            Add
          </p>
        </div>
      </div>
    </div>
  );
};
