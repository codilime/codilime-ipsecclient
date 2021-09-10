import { FC } from 'react';
import { EndpointButton } from 'common/';
import { EndpointOption, Modal } from 'template';
import { useEndpointLogic, useToggle, useModalLogic } from 'hooks/';
import { endpointsType } from 'interface/index';

interface EachEndpointType {
  data: endpointsType;
  active: boolean;
  handleActionVrfEndpoints: (action: string, data: any, id?: number) => void;
  id?: number;
}

export const EachEndpoint: FC<EachEndpointType> = ({ data, active, handleActionVrfEndpoints, id }) => {
  const { open, handleToggle } = useToggle();
  const { show, handleToggleModal } = useModalLogic();
  const { displayEndpoint, handleAddNewEndpoint, edit, handleActiveEdit } = useEndpointLogic(data, active, handleActionVrfEndpoints, id);

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
