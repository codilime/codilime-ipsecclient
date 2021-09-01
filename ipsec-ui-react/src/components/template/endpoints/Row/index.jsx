import React from 'react';
import PropTypes from 'prop-types';
import { EndpointButton } from 'common';
import { EndpointOption, Modal } from 'template';
import { useEndpointLogic, useToggle, useModalLogic } from 'hooks';

export const EachEndpoint = ({ data, active, handleActionVrfEndpoints, id, psk, handleChangePsk }) => {
  const { open, handleToggle } = useToggle();
  const { show, handleToggleModal } = useModalLogic();
  const { displayEndpoint, handleAddNewEndpoint, edit, handleActiveEdit } = useEndpointLogic(data, active, id, handleActionVrfEndpoints, psk, handleChangePsk);

  const activeButton = edit ? (
    <EndpointButton {...{ onClick: handleAddNewEndpoint }} className="table__add">
      Add
    </EndpointButton>
  ) : (
    <EndpointButton secondary onClick={handleToggle}>
      ...
    </EndpointButton>
  );

  return (
    <tr className="table__row">
      {displayEndpoint}
      <td className="table__column table__bool">
        {activeButton}
        <EndpointOption {...{ open, handleToggleModal, handleActiveEdit, handleToggle, edit, handleChangePsk }} />
        <Modal
          {...{ show, handleToggleModal, header: 'Delete endpoint', leftButton: 'cancel', rightButton: 'delete ', btnDelete: true }}
          handleDelete={() => handleActionVrfEndpoints('delete', {}, id)}
        >
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
