import React, { useState } from 'react';
import { EndpointInput, ToolTip } from 'common';
import { endpointInputSchema, endpointHardwareSchema } from 'db';
import { useValidateEndpoint, useGetLocation } from 'hooks';
import { HardwareId } from 'constant';
import classNames from 'classnames';

export const useEndpointLogic = (endpoint, active = false, id = null, handleActionVrfEndpoints) => {
  const [edit, setEdit] = useState(active);
  const { currentLocation } = useGetLocation();
  const [endpoints, setEndpoint] = useState(endpoint);
  const handleActiveEdit = () => setEdit((prev) => !prev);

  const { error, validateEmptyEndpoint, setError } = useValidateEndpoint(endpoints);
  const hardware = currentLocation === HardwareId;

  const onChange = (e) => {
    const { value, name, checked, type } = e.target;
    setError((prev) => ({ ...prev, [name]: false }));
  
    if (type === 'checkbox') {
      return setEndpoint((prev) => ({
        ...prev,
        [name]: checked
      }));
    }
    if (type === 'number') {
      return setEndpoint((prev) => ({
        ...prev,
        [name]: parseInt(value)
      }));
    }
    return setEndpoint((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const newEndpointState = edit ? endpoints : endpoint;
  const endpointSchema = hardware ? endpointHardwareSchema : endpointInputSchema;

  const displayEndpoint = endpointSchema.map((el) => {
    const toolTip = el.name === 'psk' && edit && newEndpointState[el.name] !== '' && <ToolTip>{newEndpointState[el.name]}</ToolTip>;

    if (el.type === 'checkbox') {
      return (
        <td key={el.name} className={classNames('table__column', 'table__bool')}>
          <EndpointInput {...{ ...el, onChange, edit, error }} checked={newEndpointState[el.name]} />
        </td>
      );
    }
    return (
      <td key={el.name} className={classNames('table__column', { table__psk: el.name === 'psk', table__bool: el.name === 'remote_as' })}>
        <EndpointInput {...{ ...el, onChange, edit, error }} value={newEndpointState[el.name]} />
        {toolTip}
      </td>
    );
  });

  const handleAddNewEndpoint = () => {
    const validate = validateEmptyEndpoint();
    console.log(endpoints, 'endpoints');
    if (!validate) {
      return;
    }
    if (id === null) {
      handleActionVrfEndpoints('add', endpoints);
      return setEdit(false);
    }
    handleActionVrfEndpoints('change', endpoints, id);
    return setEdit(false);
  };

  return { displayEndpoint, edit, handleAddNewEndpoint, handleActiveEdit };
};
