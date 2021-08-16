import React from 'react';
import { EndpointButton } from 'common';
import { Wrapper, EachEndpoint } from 'template';
import { useToggle, useEndpoint } from 'hooks';
import { emptyEndpointSchema, tableHeaderSchema } from 'db';
import './styles.scss';

export const Endpoints = () => {
  const { open, handleToggle } = useToggle();
  const { vrfEndpoints, handleActionVrfEndpoints } = useEndpoint(handleToggle);
  const dynamicHeader = vrfEndpoints !== null || open ? tableHeaderSchema.map(({ item }) => <th key={item}>{item}</th>) : null;

  const dynamicCreateEndpoint = vrfEndpoints && vrfEndpoints.map((el, index) => <EachEndpoint key={index} {...{ data: el, id: index, handleActionVrfEndpoints }} />);

  const createNewEndpoint = open && <EachEndpoint {...{ active: true, data: emptyEndpointSchema, handleActionVrfEndpoints }} />;

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
              <EndpointButton onClick={handleToggle}>{newEndpointButton}</EndpointButton>
            </td>
          </tr>
        </tbody>
      </table>
    </Wrapper>
  );
};
