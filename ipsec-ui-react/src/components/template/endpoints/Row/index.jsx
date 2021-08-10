import React from 'react';
import PropTypes from 'prop-types';
import { EndpointButton } from 'common';
import { useEndpointLogic, useToggle } from 'hooks';
import { EndpointOption, Modal } from 'template';
import { useModalLogic } from 'hooks';

export const EachEndpoint = ({ data, active }) => {
  const { displayEndpoint, handleAddNewEndpoint, disabled } = useEndpointLogic(data, active);
  const { open, handleToggle } = useToggle();
  const { show, handleToggleModal } = useModalLogic();

  const activeButton = active ? (
    <EndpointButton {...{ disabled, onClick: handleAddNewEndpoint }}>Add</EndpointButton>
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
        <EndpointOption {...{ open, handleToggleModal }} />
        <Modal {...{ show, handleToggleModal }} header="Delete endpoint" leftButton="cancel" rightButton="delete " btnDelete>
          Are you sure you want to delete the endpoint? This action cannot be undone
        </Modal>
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
