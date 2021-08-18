import { useState, useEffect, useContext } from 'react';
import { useFetchData, useGetLocation } from 'hooks';
import { VrfsContext } from 'context';
import { HardwareId } from 'constant';
import { defaultVrf } from 'db';

export const useGetVrfs = () => {
  const { fetchData, fetchHardwarePh1, fetchHardwarePh2, fetchSoftwareAlgorithms } = useFetchData();
  const { currentLocation, history } = useGetLocation();
  const { vrf, setVrf } = useContext(VrfsContext);
  const [vrfs, setVrfs] = useState([]);
  const { loading } = vrf;

  const cryptoPhase = async () => {
    const crypto = await fetchSoftwareAlgorithms();
    setVrf((prev) => ({ ...prev, crypto: { crypto_ph2: crypto, crypto_ph1: crypto } }));
  };

  const findActiveVrfPage = async () => {
    if (vrfs.length === 0) {
      setVrf((prev) => ({ ...defaultVrf, crypto: prev.crypto }));
      history.push('/vrf/create');
    }
    if (currentLocation === 'create') {
      setVrf((prev) => ({ ...defaultVrf, crypto: prev.crypto }));
    }
    const currentVrf = vrfs.filter(({ id }) => id === parseInt(currentLocation));

    if (currentVrf.length > 0) {
      if (currentVrf[0].id === parseInt(HardwareId)) {
        const crypto_ph1 = await fetchHardwarePh1();
        const crypto_ph2 = await fetchHardwarePh2();
        return setVrf((prev) => ({ ...prev, data: currentVrf[0], crypto: { crypto_ph1, crypto_ph2 } }));
      }
      return setVrf((prev) => ({ ...prev, data: currentVrf[0] }));
    }
  };

  useEffect(() => {
    cryptoPhase();
  }, []);

  useEffect(() => {
    if (currentLocation || vrfs.length !== 0) findActiveVrfPage();
  }, [currentLocation, vrfs]);

  useEffect(() => {
    if (vrfs.length === 0 || loading) fetchData(setVrfs);
  }, [loading]);

  return { vrfs };
};
