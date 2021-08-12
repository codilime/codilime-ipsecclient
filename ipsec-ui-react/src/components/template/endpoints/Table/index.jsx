import React, { useContext } from 'react';
import { emptyEndpointSchema, tableHeaderSchema } from 'db';
import { Wrapper, EachEndpoint } from 'template';
import { EndpointButton } from 'common';
import { useToggle } from 'hooks';
import { VrfsContext } from 'context';
import './styles.scss';

export const Endpoints = () => {
  const {
    vrf: {
      data: { endpoints }
    }
  } = useContext(VrfsContext);
  const { open, handleToggle } = useToggle();

  const dynamicHeader = endpoints !== null || open ? tableHeaderSchema.map(({ item }) => <th key={item}>{item}</th>) : null;

  const dynamicCreateEndpoint = endpoints !== null ? endpoints.map((el, index) => <EachEndpoint key={index} data={el} />) : null;

  const createNewEndpoint = open ? <EachEndpoint data={emptyEndpointSchema} edit /> : null;

  const newEndpointButton = open ? 'Close a new endpoint' : 'Add a new endpoint';

  return (
    <Wrapper title="Endpoints">
      <table className="table">
        <thead className="table__header">
          <tr>{dynamicHeader}</tr>
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
