import { useEffect } from 'react';
import { EachEndpoint } from 'template';
import { useToggle, useEndpoint, useGetLocation, useVrfLogic } from 'hooks/';
import { emptyEndpointSchema, emptyHardwareSchema, tableSoftwareHeaderSchema, tableHardwaHeaderSchema } from 'db';
import classNames from 'classnames';
import { newVrf, endpointTableConst } from 'constant/';

const { pskCertificates, nat, bgp, action, remote } = endpointTableConst;

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

  const dynamicHeader = headerSchema.map(({ header }) => {
    return (
      <th
        key={header}
        className={classNames('table__header__column', {
          table__bool: header === nat || header == bgp || header === action || header == remote,
          table__psk: header === pskCertificates
        })}
      >
        {header}
      </th>
    );
  });

  const dynamicCreateEndpoint = vrfEndpoints && vrfEndpoints.map((el, index) => <EachEndpoint key={index} {...{ active: false, endpoint: el, id: index, handleActionVrfEndpoints }} />);

  const createNewEndpoint = open && currentLocation !== newVrf && <EachEndpoint {...{ active: true, endpoint: emptySchema, handleActionVrfEndpoints, id: null }} />;

  const newEndpointButton = open ? 'Close' : 'Add a new endpoint';

  return {
    dynamicHeader,
    dynamicCreateEndpoint,
    createNewEndpoint,
    newEndpointButton,
    currentLocation,
    handleToggle
  };
};
