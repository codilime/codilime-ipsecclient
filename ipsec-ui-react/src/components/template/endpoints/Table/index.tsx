import React, { FC } from 'react';

import { EndpointButton } from 'common';
import { Wrapper } from 'template';
import { useCreateEndpointTable } from 'hooks';
import { newVrf } from 'constant';

import './styles.scss';

export const Endpoints: FC = () => {
  const { dynamicCreateEndpoint, dynamicHeader, createNewEndpoint, newEndpointButton, handleToggle, currentLocation } = useCreateEndpointTable();

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
