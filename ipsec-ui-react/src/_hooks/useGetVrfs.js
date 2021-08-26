import { useEffect, useContext } from 'react';
import { useGetLocation } from 'hooks';
import { VrfsContext } from 'context';
import { HardwareId } from 'constant';
import { defaultVrf } from 'db';

export const useGetVrfs = () => {
  const { currentLocation, history } = useGetLocation();
  const { vrf, setVrf } = useContext(VrfsContext);
  const { vrfs } = vrf;

  const findActiveVrfPage = async () => {
    if (!vrfs) {
      setVrf((prev) => ({ ...prev, data: defaultVrf.data }));
      history.push('/vrf/create');
    }
    if (currentLocation === 'create') {
      setVrf((prev) => ({ ...prev, data: defaultVrf.data }));
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
    if (currentLocation && vrfs) findActiveVrfPage();
  }, [currentLocation, vrfs]);
  return { vrfs };
};
