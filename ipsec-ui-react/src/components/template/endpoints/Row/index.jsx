import React from 'react';
import PropTypes from 'prop-types';
import { EndpointButton } from 'common';
import { useEndpointLogic, useToggle } from 'hooks';
import { EndpointOption } from 'template';

export const EachEndpoint = ({ data, active, disabled }) => {
  const { displayEndpoint } = useEndpointLogic(data, active);
  const { open, handleToggle } = useToggle();

  const activeButton = active ? (
    <EndpointButton {...{ disabled }}>Add</EndpointButton>
  ) : (
    <EndpointButton secondary onClick={handleToggle}>
      ...
    </EndpointButton>
  );

  return (
    <tr className="table__row">
      {displayEndpoint}
      <td className="table__column">
        {activeButton}
        <EndpointOption {...{ open }} />
      </td>
    </tr>
  );
};

EachEndpoint.propTypes = {
  data: PropTypes.shape({
    remote_ip_sec: PropTypes.string,
    local_ip: PropTypes.string,
    peer_ip: PropTypes.string,
    psk: PropTypes.string,
    nat: PropTypes.bool,
    gp: PropTypes.bool
  }),
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  open: PropTypes.bool,
  handleToggle: PropTypes.func
};
