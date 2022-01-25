/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { useLayoutEffect } from 'react';
import { useGetLocation, useAppContext } from 'hooks/';
import { HardwareId } from 'interface/enum';
import { defaultVrf } from 'db';

export const useGetVrfs = (vrfId?: string) => {
  const { currentLocation, history } = useGetLocation();
  const {
    context: { vrf },
    setContext
  } = useAppContext();

  const findActiveVrfPage = () => {
    if (!vrf.length) {
      setContext((prev) => ({ ...prev, data: defaultVrf.data }));
      return history.push('/vrf/create');
    }
    if (!vrfId) {
      return setContext((prev) => ({ ...prev, data: defaultVrf.data }));
    }

    const currentVrf = vrf.filter(({ id }) => id === parseInt(vrfId))[0];

    if (currentVrf) {
      return setContext((prev) => ({ ...prev, data: currentVrf }));
    }
  };

  useLayoutEffect(() => {
    if (currentLocation === HardwareId) {
      setContext((prev) => ({ ...prev, hardware: true }));
    } else {
      setContext((prev) => ({ ...prev, hardware: false }));
    }
  }, [currentLocation]);

  useLayoutEffect(() => {
    if (currentLocation) findActiveVrfPage();
  }, [currentLocation, vrf]);

  return { vrf, findActiveVrfPage };
};
