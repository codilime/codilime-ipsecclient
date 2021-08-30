import React, { useState, useEffect } from 'react';
import { EachEndpoint } from 'template';
import { useToggle, useEndpoint, useGetLocation, useVrfLogic } from 'hooks';
import { emptyEndpointSchema, emptyHardwareSchema, tableSoftwareHeaderSchema, tableHardwaHeaderSchema } from 'db';
import classNames from 'classnames';
import { newVrf, endpointTableConst } from 'constant';

const { pskCertificates, nat, bgp, action, remote } = endpointTableConst;

export const useCreateEndpointTable = () => {
  const [psk, setPsk] = useState({ psk: false, certificates: false });
  const { open, handleToggle } = useToggle();
  const { hardware } = useVrfLogic();
  const { vrfEndpoints, handleActionVrfEndpoints } = useEndpoint(handleToggle);
  const { currentLocation } = useGetLocation();

  useEffect(() => {
    if (open) handleToggle();
  }, [currentLocation]);

  const handleChangePsk = (name) => {
    if (name === 'reset') {
      return setPsk({ psk: false, certificates: false });
    }
    if (name === 'psk') {
      return setPsk({ psk: true, certificates: false });
    }
    return setPsk({ certificates: true, psk: false });
  };

  useEffect(() => {
    if (!open) {
      setPsk({ psk: false, certificates: false });
    }
  }, [open]);

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

  const dynamicCreateEndpoint = vrfEndpoints && vrfEndpoints.map((el, index) => <EachEndpoint key={index} {...{ data: el, id: index, handleActionVrfEndpoints, handleChangePsk, psk }} />);

  const createNewEndpoint = open && currentLocation !== newVrf && <EachEndpoint {...{ active: true, data: emptySchema, handleActionVrfEndpoints, handleChangePsk, psk }} />;

  const newEndpointButton = open ? 'Close a new endpoint' : 'Add a new endpoint';

  return {
    dynamicHeader,
    dynamicCreateEndpoint,
    createNewEndpoint,
    newEndpointButton,
    handleToggle,
    currentLocation,
    handleChangePsk,
    psk
  };
};
