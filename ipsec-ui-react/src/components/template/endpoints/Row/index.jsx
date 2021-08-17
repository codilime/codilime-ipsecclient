import React from 'react';
import PropTypes from 'prop-types';
import { EndpointButton } from 'common';
import { EndpointOption, Modal } from 'template';
import { useEndpointLogic, useToggle, useModalLogic } from 'hooks';

export const EachEndpoint = ({ data, active, handleActionVrfEndpoints, id }) => {
  const { open, handleToggle } = useToggle();
  const { show, handleToggleModal } = useModalLogic();
  const { displayEndpoint, handleAddNewEndpoint, edit, handleActiveEdit } = useEndpointLogic(data, active, data.id, handleActionVrfEndpoints);

  const activeButton = edit ? (
    <EndpointButton {...{ onClick: handleAddNewEndpoint }}>Add</EndpointButton>
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
        <EndpointOption {...{ open, handleToggleModal, handleActiveEdit, handleToggle }} />
        <Modal {...{ show, handleToggleModal }} handleDelete={() => handleActionVrfEndpoints('delete', {}, id)} header="Delete endpoint" leftButton="cancel" rightButton="delete " btnDelete>
          Are you sure you want to delete the endpoint? This action cannot be undone
        </Modal>
      </td>
    </tr>
  );
};

EachEndpoint.defaultProps = {
  id: null,
  active: false
};
EachEndpoint.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string,
    remote_ip_sec: PropTypes.string,
    local_ip: PropTypes.string,
    peer_ip: PropTypes.string,
    psk: PropTypes.string,
    nat: PropTypes.bool,
    gp: PropTypes.bool
  }),
  disabled: PropTypes.bool,
  active: PropTypes.bool,
  id: PropTypes.number,
  handleActionVrfEndpoints: PropTypes.func
};
