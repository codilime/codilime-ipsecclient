import React, { FC } from 'react';
import { EndpointButton } from 'common';
import { EndpointOption, Modal } from 'template';
import { useEndpointLogic, useToggle, useModalLogic } from 'hooks';

interface EachEndpointProps {
  data: {
    id: string;
    remote_ip_sec: string;
    local_ip: string;
    peer_ip: string;
    psk: string;
    nat: boolean;
    gp: boolean;
  };
  disabled: boolean;
  active: boolean;
  id: number;
  handleActionVrfEndpoints: () => void;
}

export const EachEndpoint: FC<EachEndpointProps> = ({ data, active = false, handleActionVrfEndpoints, id = null }) => {
  const { open, handleToggle } = useToggle();
  const { show, handleToggleModal } = useModalLogic();
  const { displayEndpoint, handleAddNewEndpoint, edit, handleActiveEdit } = useEndpointLogic(data, active, id, handleActionVrfEndpoints);

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
        <EndpointOption {...{ open, handleToggleModal, handleActiveEdit, handleToggle }} />
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
