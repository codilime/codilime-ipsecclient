import { FC } from 'react';
import { EndpointButton, EndpointInput, ToolTipInfo } from 'common/';
import { EndpointOption, Modal } from 'template';
import { useEndpointLogic, useToggle, useModalLogic } from 'hooks/';
import { EndpointsType } from 'interface/index';
import classNames from 'classnames';

interface EachEndpointType {
  currentEndpoint: EndpointsType;
  active: boolean;
  handleActionVrfEndpoints: (action: string, data: EndpointsType, id?: number) => void;
  id: number | null;
}

export const EachEndpoint: FC<EachEndpointType> = ({ currentEndpoint, active, handleActionVrfEndpoints, id }) => {
  const { open, handleToggle } = useToggle();
  const { show, handleToggleModal } = useModalLogic();
  const { endpointAttributes, handleAddNewEndpoint, handleActiveEdit } = useEndpointLogic({ currentEndpoint, active, handleActionVrfEndpoints, id });
  const { endpointSchema, endpoints, edit, error, onChange, handleGeneratePskField } = endpointAttributes;

  const displayEndpoint =
    endpoints &&
    endpointSchema.map((el) => {
      switch (el.name) {
        case 'psk':
          return handleGeneratePskField(el);
        case 'nat':
        case 'bgp':
          return (
            <td key={el.name} className={classNames('table__column', 'table__bool')}>
              <EndpointInput {...{ ...el, onChange, edit, error, checked: endpoints[el.name] }} />
            </td>
          );
        default:
          return (
            <td key={el.name} className={classNames('table__column', { table__bool: el.name === 'remote_as' })}>
              <EndpointInput {...{ ...el, onChange, edit, error, value: endpoints[el.name] }} />
              {edit && <ToolTipInfo {...{ error: error[el.name] }}>{el.tooltip}</ToolTipInfo>}
            </td>
          );
      }
    });

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
          handleDelete={() => handleActionVrfEndpoints('delete', currentEndpoint, id!)}
        >
          Are you sure you want to delete the endpoint? This action cannot be undone
        </Modal>
      </td>
    </tr>
  );
};
