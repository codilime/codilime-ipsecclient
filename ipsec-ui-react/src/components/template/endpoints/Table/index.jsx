import React from 'react';
import { EndpointButton } from 'common';
import { Wrapper, EachEndpoint } from 'template';
import { useToggle, useEndpoint, useGetLocation, useVrfLogic } from 'hooks';
import { emptyEndpointSchema, emptyHardwareSchema, tableSoftwareHeaderSchema, tableHardwaHeaderSchema } from 'db';
import { newVrf } from 'constant';
import classNames from 'classnames';
import './styles.scss';

export const Endpoints = () => {
  const { open, handleToggle } = useToggle();
  const { hardware } = useVrfLogic();
  const { vrfEndpoints, handleActionVrfEndpoints } = useEndpoint(handleToggle);
  const { currentLocation } = useGetLocation();

  const headerSchema = hardware ? tableHardwaHeaderSchema : tableSoftwareHeaderSchema;
  const emptySchema = hardware ? emptyHardwareSchema : emptyEndpointSchema;

  const dynamicHeader = headerSchema.map(({ item }) => (
    <th key={item} className={classNames('table__header__column', { table__bool: item === 'NAT' || item == 'BGP' || item === 'ACTION' || item == 'Remote AS', table__psk: item === 'PSK' })}>
      {item}
    </th>
  ));

  const dynamicCreateEndpoint = vrfEndpoints && vrfEndpoints.map((el, index) => <EachEndpoint key={index} {...{ data: el, id: index, handleActionVrfEndpoints }} />);

  const createNewEndpoint = open && currentLocation !== newVrf && <EachEndpoint {...{ active: true, data: emptySchema, handleActionVrfEndpoints }} />;

  const newEndpointButton = open ? 'Close a new endpoint' : 'Add a new endpoint';

  return (
    <Wrapper title="Endpoints">
      <table className="table">
        <thead className="table__header">
          <tr className="table__row--header">{dynamicHeader}</tr>
        </thead>
        <tbody className="table__body">
          {dynamicCreateEndpoint}
          {createNewEndpoint}
          <tr className="table__addBtn">
            <td className="table__columnBtn">
              <EndpointButton disabled={currentLocation === newVrf} onClick={handleToggle}>
                {newEndpointButton}
              </EndpointButton>
            </td>
          </tr>
        </tbody>
      </table>
    </Wrapper>
  );
};
