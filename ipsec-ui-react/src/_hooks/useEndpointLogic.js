import React, { useState } from 'react';
import { EndpointInput } from 'common';
import { endpointInputSchema } from 'db';
import classNames from 'classnames';

export const useEndpointLogic = (endpoint, active = false, id = null, handleActionVrfEndpoints) => {
  const [edit, setEdit] = useState(active);
  const [endpoints, setEndpoint] = useState(endpoint);
  const handleActiveEdit = () => setEdit((prev) => !prev);

  const onChange = (e) => {
    const { value, name, checked, type } = e.target;
    if (type === 'checkbox') {
      return setEndpoint((prev) => ({
        ...prev,
        [name]: checked
      }));
    }
    return setEndpoint((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const newEndpointState = edit ? endpoints : endpoint;

  const displayEndpoint = endpointInputSchema.map((el) => {
    if (el.type === 'checkbox') {
      return (
        <td key={el.name} className="table__column table__bool">
          <EndpointInput {...{ ...el, onChange, edit }} checked={newEndpointState[el.name]} />
        </td>
      );
    }
    return (
      <td key={el.name} className={classNames({ table__column: true, table__psk: el.name === 'psk' })}>
        <EndpointInput {...{ ...el, onChange, edit }} value={newEndpointState[el.name]} />
      </td>
    );
  });
  
  const handleAddNewEndpoint = () => {
    if (id === null) {
      handleActionVrfEndpoints('add', endpoints);
      return setEdit(false);
    }
    handleActionVrfEndpoints('change', endpoints, id);
    return setEdit(false);
  };

  return { displayEndpoint, edit, handleAddNewEndpoint, handleActiveEdit };
};
