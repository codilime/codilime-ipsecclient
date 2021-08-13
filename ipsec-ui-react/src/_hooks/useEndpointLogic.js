import React, { useState } from 'react';
import { EndpointInput } from 'common';
import { endpointInputSchema } from 'db';

export const useEndpointLogic = (endpoint, active = false, id = null, handleActionVrfEndponts) => {
  const [edit, setEdit] = useState(active);
  const [endpoints, setEndpoint] = useState(endpoint);
  const handleActiveEdit = () => setEdit((prev) => !prev);

  const onChange = (e) => {
    const { value, name } = e.target;
    setEndpoint((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const onClick = (e) => {
    const { checked, name } = e.target;
    setEndpoint((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  const newEndpointState = edit ? endpoints : endpoint;

  const displayEndpoint = endpointInputSchema.map((el) => {
    if (el.type === 'checkbox') {
      return (
        <td key={el.name} className="table__column">
          <EndpointInput {...{ ...el, onClick, edit }} value={newEndpointState[el.name]} />
          <span>Active</span>
        </td>
      );
    }
    return (
      <td key={el.name} className="table__column">
        <EndpointInput {...{ ...el, onChange, edit }} value={newEndpointState[el.name]} />
      </td>
    );
  });

  const handleAddNewEndpoint = () => {
    if (id === null) {
      handleActionVrfEndponts('add', endpoints);
      return setEdit(false);
    }
    handleActionVrfEndponts('change', endpoints, id);
    return setEdit(false);
  };

  return { displayEndpoint, edit, onClick, handleAddNewEndpoint, handleActiveEdit };
};
