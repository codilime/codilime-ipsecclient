import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { emptyEndpointSchema, endpoint, tableHeaderSchema } from 'db';
import { Wrapper, EachEndpoint } from 'template';
import { EndpointButton } from 'common';
import { useToggle } from 'hooks';
import './styles.scss';

export const Endpoints = ({ data }) => {
  const { open, handleToggle } = useToggle();

  const dynamicHeader = tableHeaderSchema.map((el) => <th className={el.className} key={el.item}>{el.item}</th>);

  const dynamicCreateEndpoint = useMemo(() => endpoint.map((header, index) => <EachEndpoint key={index} data={header} />), [endpoint]);

  const createNewEndpoint = open ? <EachEndpoint data={emptyEndpointSchema} active disabled /> : null;

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

Endpoints.propTypes = {
  data: PropTypes.objectOf({
    remote_ip_sec: PropTypes.string,
    local_ip: PropTypes.string,
    peer_ip: PropTypes.string,
    psk: PropTypes.string,
    nat: PropTypes.bool,
    bgp: PropTypes.bool
  })
};
