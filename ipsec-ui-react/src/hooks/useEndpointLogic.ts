import { useState, useEffect, ChangeEvent } from 'react';
import { endpointInputSchema, endpointHardwareSchema, emptyEndpointSchema, emptyHardwareSchema } from 'db';
import { useValidateEndpoint, useVrfLogic, useChoiceCertyficate } from 'hooks/';
import { EndpointsType } from 'interface/index';

interface EndpointLogicType {
  currentEndpoint: EndpointsType;
  active: boolean;
  handleActionVrfEndpoints: (action: string, data: EndpointsType, id?: number) => void;
  id: number | null;
}

export const useEndpointLogic = ({ currentEndpoint, active, handleActionVrfEndpoints, id }: EndpointLogicType) => {
  const { hardware, endpoint, vrf_id } = useVrfLogic();
  const { error, validateEmptyEndpoint, setError } = useValidateEndpoint();
  const emptyEndpoint = hardware ? emptyHardwareSchema : emptyEndpointSchema;
  const [endpoints, setEndpoint] = useState<EndpointsType>(emptyEndpoint);
  const [edit, setEdit] = useState(active);
  const { handleGeneratePskField } = useChoiceCertyficate({ edit, error, setEndpoint, endpoints });

  const handleActiveEdit = () => setEdit((prev) => !prev);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name, checked, type } = e.target;
    setError((prev) => ({ ...prev, [name]: false }));
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

  useEffect(() => {
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
      handleActionVrfEndpoints('add', { ...endpoints, id: endpoint.length + 1, source_interface: '', remote_as: 6500 });
      return setEdit(false);
    }
    handleActionVrfEndpoints('change', endpoints, id);
    return setEdit(false);
  };

  const endpointAttributes = {
    endpoints,
    endpointSchema,
    error,
    edit,
    onChange,
    handleGeneratePskField
  };

  return { endpointAttributes, handleAddNewEndpoint, handleActiveEdit };
};
