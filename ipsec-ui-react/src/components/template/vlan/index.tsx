import { FC } from 'react';
import { useVlanLogic } from 'hooks/';
import { EachVlan } from './eachVlan';
import { VlanInput } from './vlanInput';
import './styles.scss';

interface vlanType {
  setValue: any;
  errorSchema?: any;
}

export const Vlan: FC<vlanType> = ({ setValue, errorSchema }) => {
  const { vlan, error, vlanInterface, handleAddNewVlan, handleDeleteVlan, handleChangeInputValue } = useVlanLogic(setValue);

  const errorMessage = errorSchema ? <p className="vlan__cancel">{errorSchema.message}</p> : 'There are no active Vlan and no Lan IP Mask';

  const displayVlans =
    vlan === null || !vlan.length ? (
      <tr className="vlan__row__empty">
        <td>{errorMessage}</td>
      </tr>
    ) : (
      vlan.map((el) => <EachVlan key={el.vlan} {...{ ...el, onClick: handleDeleteVlan }} />)
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
          <VlanInput {...{ name: 'vlan', text: 'Vlan', onChange: handleChangeInputValue, value: vlanInterface.vlan, error, tooltip: 'Provide value from 1 to 4094' }} />
          <VlanInput {...{ name: 'lan_ip', text: 'Lan IP', onChange: handleChangeInputValue, value: vlanInterface.lan_ip, error, tooltip: 'Provide correct IP, i.e. 10.1.1.1/32' }} />
          <p className="vlan__btn" onClick={handleAddNewVlan}>
            Add
          </p>
        </div>
      </div>
    </div>
  );
};
