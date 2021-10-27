import { useEffect } from 'react';
import { useGetLocation, useAppContext } from 'hooks/';
import { HardwareId } from 'constant/';
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

  useEffect(() => {
    if (currentLocation === HardwareId) {
      setContext((prev) => ({ ...prev, hardware: true }));
    } else {
      setContext((prev) => ({ ...prev, hardware: false }));
    }
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation) findActiveVrfPage();
  }, [currentLocation, vrf]);

  return { vrf, findActiveVrfPage };
};
