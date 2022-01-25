/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC, useState } from 'react';
import { SecondaryButton, EndpointInput, ToolTipInfo, ComboBox } from 'common/';
import { EndpointOption, Modal } from 'template';
import { useEndpointLogic, useToggle, useModalLogic } from 'hooks/';
import { EndpointsType } from 'interface/index';
import { BiArrowFromLeft, BiArrowFromTop } from 'react-icons/bi';
import classNames from 'classnames';

interface EachEndpointType {
  currentEndpoint: EndpointsType;
  active: boolean;
  handleActionVrfEndpoints: (action: string, data: EndpointsType, id?: number) => void;
  id: number | null;
}

export const EachEndpoint: FC<EachEndpointType> = ({ currentEndpoint, active, handleActionVrfEndpoints, id }) => {
  const { open, handleToggle } = useToggle();
  const [advanced, setAdvanced] = useState(false);
  const { show, handleToggleModal } = useModalLogic();
  const { endpointAttributes, handleAddNewEndpoint, handleActiveEdit } = useEndpointLogic({ currentEndpoint, active, handleActionVrfEndpoints, id });
  const { endpointSchema, endpointAdvancedSchema, endpoints, edit, error, sourceInterface, onChange, handleGeneratePskField } = endpointAttributes;

  const handleOpenAdvanced = () => setAdvanced((prev) => !prev);

  const displayEndpoint = endpointSchema.map((el) => {
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
      case 'remote_ip_sec': {
        return (
          <td key={el.name} className="table__column">
            <EndpointInput {...{ ...el, onChange, edit, error, value: endpoints[el.name], onlyNumber: true }} />
          </td>
        );
      }
      case 'source_interface': {
        return (
          <td key={el.name} className={classNames('table__column')}>
            <ComboBox {...{ ...el, onChange, edit, error, value: endpoints[el.name], list: 'source-Interface', sourceInterface }} />
          </td>
        );
      }
      case 'local_id':
        return;
      default:
        return (
          <td key={el.name} className={classNames('table__column', { table__bool: el.name === 'remote_as' })}>
            <EndpointInput {...{ ...el, onChange, edit, error, value: endpoints[el.name], onlyNumber: true }} />
            {edit && <ToolTipInfo {...{ error: error[el.name] }}>{el.tooltip}</ToolTipInfo>}
          </td>
        );
    }
  });

  const advantageConfiguration = endpointAdvancedSchema.map((el) => (
    <td key={el.name} className={classNames('advanced__column')}>
      <label className="advanced__label">{el.text}</label>
      <EndpointInput {...{ ...el, onChange, edit, error, value: endpoints.authentication['local_id'] }} />
    </td>
  ));

  const activeButton = edit ? (
    <SecondaryButton {...{ onClick: handleAddNewEndpoint }} table className="table__add">
      Add
    </SecondaryButton>
  ) : (
    <SecondaryButton secondary table onClick={handleToggle}>
      ...
    </SecondaryButton>
  );

  const advancedIcon = advanced ? <BiArrowFromTop className="table__toggle__icon" onClick={handleOpenAdvanced} /> : <BiArrowFromLeft className="table__toggle__icon" onClick={handleOpenAdvanced} />;

  return (
    <>
      <tr className={classNames('table__row', { table__row__edit: edit, table__row__advantage: true })}>
        {edit && <td className="table__toggle">{advancedIcon}</td>}
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
      {advanced && (
        <tr className="advanced">
          <td className="advanced__header">
            <h3 className="advanced__title">Advanced Configuration</h3>
          </td>
          {advantageConfiguration}
        </tr>
      )}
    </>
  );
};
