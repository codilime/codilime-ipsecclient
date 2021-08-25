import React, { useState, useEffect } from 'react';
import { EndpointInput, ToolTip } from 'common';
import { endpointInputSchema, endpointHardwareSchema } from 'db';
import { useValidateEndpoint, useVrfLogic } from 'hooks';
import classNames from 'classnames';

export const useEndpointLogic = (endpoint, active, id, handleActionVrfEndpoints) => {
  const [edit, setEdit] = useState(active);
  const [endpoints, setEndpoint] = useState(null);
  const { hardware } = useVrfLogic();
  const { error, validateEmptyEndpoint, setError } = useValidateEndpoint(endpoints);
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
      const toolTip = el.name === 'psk' && edit && endpoints[el.name] !== '' && <ToolTip>{endpoints[el.name]}</ToolTip>;

      if (el.type === 'checkbox') {
        return (
          <td key={el.name} className={classNames('table__column', 'table__bool')}>
            <EndpointInput {...{ ...el, onChange, edit, error }} checked={endpoints[el.name]} />
          </td>
        );
      }
      return (
        <td key={el.name} className={classNames('table__column', { table__psk: el.name === 'psk', table__bool: el.name === 'remote_as' })}>
          <EndpointInput {...{ ...el, onChange, edit, error }} value={endpoints[el.name]} />
          {toolTip}
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
