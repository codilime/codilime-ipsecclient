import { useEffect } from 'react';
import { useToggle, useEndpoint, useGetLocation, useVrfLogic } from 'hooks/';
import { emptyEndpointSchema, emptyHardwareSchema, tableSoftwareHeaderSchema, tableHardwaHeaderSchema } from 'db';

export const useCreateEndpointTable = () => {
  const { open, handleToggle } = useToggle();
  const { hardware } = useVrfLogic();
  const { vrfEndpoints, handleActionVrfEndpoints } = useEndpoint(handleToggle);
  const { currentLocation } = useGetLocation();

  useEffect(() => {
    if (open) handleToggle();
  }, [currentLocation]);

  const headerSchema = hardware ? tableHardwaHeaderSchema : tableSoftwareHeaderSchema;
  const emptySchema = hardware ? emptyHardwareSchema : emptyEndpointSchema;

  return {
    open,
    vrfEndpoints,
    emptySchema,
    headerSchema,
    currentLocation,
    handleToggle,
    handleActionVrfEndpoints
  };
};
