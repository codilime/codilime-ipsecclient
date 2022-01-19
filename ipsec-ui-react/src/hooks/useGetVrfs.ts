import { useEffect, useLayoutEffect, useCallback } from 'react';
import { useGetLocation, useAppContext } from 'hooks/';
import { HardwareId } from 'constant/';
import { defaultVrf, DefaultVrfData } from 'db';
import { useDataContext, useVrfContext } from './useAppContext';

export const useGetVrfs = (vrfId?: string) => {
  const { currentLocation, history } = useGetLocation();
  const { appContext, setAppContext } = useDataContext();
  const { vrfContext, setVrfContext } = useVrfContext();
  const { vrf, hardware } = appContext;
  // const {
  //   context: { vrf, hardware },
  //   setContext
  // } = useAppContext();

  const findActiveVrfPage = useCallback(() => {
    if (!vrf.length) {
      setVrfContext(DefaultVrfData);
      return history.push('/vrf/create');
    }
    if (!vrfId) {
      return setVrfContext(DefaultVrfData);
    }
    const currentVrf = vrf.filter(({ id }) => id === parseInt(vrfId))[0];
    if (currentVrf) {
      return setVrfContext(currentVrf);
    }
  }, [vrf, vrfId]);

  useEffect(() => {
    if (currentLocation === HardwareId) {
      setAppContext((prev) => ({ ...prev, hardware: true }));
    } else if (hardware) {
      setAppContext((prev) => ({ ...prev, hardware: false }));
    }
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation) findActiveVrfPage();
  }, [currentLocation, vrf]);

  return { vrfContext };
};
