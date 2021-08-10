import React, { useState, useContext } from 'react';
import { EndpointInput } from 'common';
import { endpointInputSchema } from 'db';
import { VrfsContext } from 'context';

export const useEndpointLogic = (data, active) => {
  const [disabled, setDisable] = useState(false);
  const [endpoint, setEndpoint] = useState(data);
  const { vrf, setVrf } = useContext(VrfsContext);

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

  const displayEndpoint = endpointInputSchema.map((el) => {
    if (el.type === 'checkbox') {
      return (
        <td key={el.name} className="table__column">
          <EndpointInput {...{ ...el, onClick }} value={endpoint[el.name]} />
          <span>Active</span>
        </td>
      );
    } else
      return (
        <td key={el.name} className="table__column">
          <EndpointInput {...{ ...el, onChange, active }} value={endpoint[el.name]} />
        </td>
      );
  });

  const handleAddNewEndpoint = () => {
    if (endpoint.psk !== '') {
      setVrf((prev) => ({
        ...prev,
        endpoints: [endpoint]
      }));
      setEndpoint(data);
    }
  };

  return { displayEndpoint, onClick, handleAddNewEndpoint, disabled };
};
