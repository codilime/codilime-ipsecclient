/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { useState, useEffect, ChangeEvent, useLayoutEffect } from 'react';
import { endpointInputSchema, endpointHardwareSchema, EndpointSchema, endpointAdvancedSchema } from 'db';
import { useValidateEndpoint, useVrfLogic, useChoiceCertyficate } from 'hooks/';
import { EndpointsType } from 'interface/index';

interface EndpointLogicType {
  currentEndpoint: EndpointsType;
  active: boolean;
  handleActionVrfEndpoints: (action: string, data: EndpointsType, id?: number) => void;
  id: number | null;
}

export const useEndpointLogic = ({ currentEndpoint, active, handleActionVrfEndpoints, id }: EndpointLogicType) => {
  const [endpoints, setEndpoint] = useState<EndpointsType>(EndpointSchema);
  const [edit, setEdit] = useState(active);
  const { error, validateEmptyEndpoint, setError } = useValidateEndpoint();
  const { hardware, vrf_id, sourceInterface } = useVrfLogic();
  const { handleGeneratePskField } = useChoiceCertyficate({ edit, error, setEndpoint, endpoints });
  const handleActiveEdit = () => setEdit((prev) => !prev);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name, checked, type } = e.target;

    setError((prev) => ({ ...prev, [name]: false }));

    if (name === 'local_id') {
      return setEndpoint((prev) => ({
        ...prev,
        authentication: {
          ...prev.authentication,
          [name]: value
        }
      }));
    }

    switch (type) {
      case 'checkbox':
        return setEndpoint((prev) => ({
          ...prev,
          [name]: checked
        }));
      case 'number':
        return setEndpoint((prev) => ({
          ...prev,
          [name]: parseInt(value)
        }));
      default:
        return setEndpoint((prev) => ({
          ...prev,
          [name]: value
        }));
    }
  };

  useLayoutEffect(() => {
    setEndpoint({ ...currentEndpoint, vrf_id });
  }, [currentEndpoint]);

  useEffect(() => {
    return () => {
      setEdit(false);
    };
  }, [currentEndpoint]);

  const endpointSchema = hardware ? endpointHardwareSchema : endpointInputSchema;

  const handleAddNewEndpoint = () => {
    const validate = validateEmptyEndpoint(endpoints);

    if (!validate) return;

    if (id === null) {
      handleActionVrfEndpoints('add', endpoints);
      return setEdit(false);
    }

    handleActionVrfEndpoints('change', endpoints, id);
    return setEdit(false);
  };
  const endpointAttributes = {
    endpoints,
    endpointSchema,
    endpointAdvancedSchema,
    error,
    edit,
    sourceInterface,
    onChange,
    handleGeneratePskField
  };
  console.log(endpoints)
  return { endpointAttributes, handleAddNewEndpoint, handleActiveEdit };
};
