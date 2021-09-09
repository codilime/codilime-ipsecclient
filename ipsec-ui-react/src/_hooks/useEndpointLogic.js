import React, { useState, useEffect } from 'react';
import { EndpointInput, ToolTipInfo } from 'common';
import { endpointInputSchema, endpointHardwareSchema, emptyEndpointSchema, emptyHardwareSchema } from 'db';
import { useValidateEndpoint, useVrfLogic, useChoiceCertyficate } from 'hooks';
import classNames from 'classnames';

export const useEndpointLogic = (endpoint, active, id, handleActionVrfEndpoints) => {
  const [edit, setEdit] = useState(active);
  const { hardware } = useVrfLogic();
  const emptyEndpoint = hardware ? emptyHardwareSchema : emptyEndpointSchema;
  const [endpoints, setEndpoint] = useState(emptyEndpoint);
  const { error, validateEmptyEndpoint, setError } = useValidateEndpoint(endpoints);
  const { handleGeneratePskField } = useChoiceCertyficate(edit, error, setEndpoint, endpoints);
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
            <EndpointInput {...{ ...el, onChange, edit, error, checked: endpoints[el.name] }} />
          </td>
        );
      }
      if (el.name === 'psk') {
        return handleGeneratePskField(el);
      } else
        return (
          <td key={el.name} className={classNames('table__column', { table__psk: el.name === 'psk', table__bool: el.name === 'remote_as' })}>
            <EndpointInput {...{ ...el, onChange, edit, error, value: endpoints[el.name] }} />
            {edit && (
              <ToolTipInfo {...{ error: error[el.name] }}>
                <p>Max value 255.255.255.255</p> <p>Min value 0.0.0.0</p>
              </ToolTipInfo>
            )}
          </td>
        );
    });

  const handleAddNewEndpoint = () => {
    const validate = validateEmptyEndpoint(endpoints);
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
