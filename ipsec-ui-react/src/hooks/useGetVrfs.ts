import { useEffect } from 'react';
import { useGetLocation, useAppContext } from 'hooks/';
import { HardwareId } from 'constant/';
import { defaultVrf } from 'db';

export const useGetVrfs = (vrfId?: string) => {
  const { currentLocation, history } = useGetLocation();
  const { vrf, setVrf } = useAppContext();

  const { vrfs } = vrf;

  const findActiveVrfPage = () => {
    if (!vrfs.length) {
      setVrf((prev) => ({ ...prev, data: defaultVrf.data }));
      return history.push('/vrf/create');
    }
    if (!vrfId) {
      return setVrf((prev) => ({ ...prev, data: defaultVrf.data }));
    }

    const currentVrf = vrfs.filter(({ id }) => id === parseInt(vrfId))[0];

    if (currentVrf) {
      return setVrf((prev) => ({ ...prev, data: currentVrf }));
    }
  };

  useEffect(() => {
    if (currentLocation === HardwareId) {
      setVrf((prev) => ({ ...prev, hardware: true }));
    } else {
      setVrf((prev) => ({ ...prev, hardware: false }));
    }
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation) findActiveVrfPage();
  }, [currentLocation, vrfs]);

  return { vrfs, findActiveVrfPage };
};
