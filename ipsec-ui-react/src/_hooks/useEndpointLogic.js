import React, { useState, useEffect } from 'react';
import { EndpointInput } from 'common';
import { endpointInputSchema, endpointHardwareSchema } from 'db';
import { useValidateEndpoint, useVrfLogic, useChoiceCertyficate } from 'hooks';
import classNames from 'classnames';

export const useEndpointLogic = (endpoint, active, id, handleActionVrfEndpoints, psk, handleChangePsk) => {
  const [edit, setEdit] = useState(active);
  const [endpoints, setEndpoint] = useState(null);
  const { hardware } = useVrfLogic();
  const { error, validateEmptyEndpoint, setError } = useValidateEndpoint(endpoints);
  const { handleGeneratePskField } = useChoiceCertyficate(edit, onchange, error, handleChangePsk, psk, setEndpoint, endpoints);

  const handleActiveEdit = () => setEdit((prev) => !prev);

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

  useEffect(() => {
    setEndpoint(endpoint);
  }, [endpoint]);

  useEffect(() => {
    return () => {
      setEdit(false);
    };
  }, [endpoint]);

  const endpointSchema = hardware ? endpointHardwareSchema : endpointInputSchema;

  const displayEndpoint =
    endpoints &&
    endpointSchema.map((el) => {
      if (el.type === 'checkbox') {
        return (
          <td key={el.name} className={classNames('table__column', 'table__bool')}>
            <EndpointInput {...{ ...el, onChange, edit, error }} checked={endpoints[el.name]} />
          </td>
        );
      }
      if (el.name === 'psk') {
        return handleGeneratePskField(el);
      } else
        return (
          <td key={el.name} className={classNames('table__column', { table__psk: el.name === 'psk', table__bool: el.name === 'remote_as' })}>
            <EndpointInput {...{ ...el, onChange, edit, error }} value={endpoints[el.name]} />
          </td>
        );
    });

  const handleAddNewEndpoint = () => {
    const validate = validateEmptyEndpoint(endpoints);
    console.log(endpoints, validate);
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
