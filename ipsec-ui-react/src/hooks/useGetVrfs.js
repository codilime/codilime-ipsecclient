import { useEffect, useContext } from 'react';
import { useGetLocation } from 'hooks';
import { HardwareId } from 'constant';
import { defaultVrf } from 'db';
import { useGetContextValues } from './useGetContextValues';

export const useGetVrfs = () => {
  const { currentLocation, history } = useGetLocation();
  const { vrf, setVrf } = useGetContextValues();
  const { vrfs } = vrf;

  const findActiveVrfPage = () => {
    if (!vrfs.length) {
      setVrf((prev) => ({ ...prev, data: defaultVrf.data }));
      return history.push('/vrf/create');
    }
    if (currentLocation === 'create') {
      return setVrf((prev) => ({ ...prev, data: defaultVrf.data }));
    }
    const currentVrf = vrfs.filter(({ id }) => id === parseInt(currentLocation))[0];

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
  return { vrfs };
};
