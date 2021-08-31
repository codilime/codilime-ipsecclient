import { useContext } from 'react';
import { useFetchData } from 'hooks';
import { VrfsContext } from 'context';

export const useInitData = () => {
  const { fetchData, fetchHardwarePh1, fetchHardwarePh2, fetchSoftwareAlgorithms } = useFetchData();
  const {
    vrf: { loading },
    setVrf
  } = useContext(VrfsContext);

  const fetchVrfSettings = async () => {
    const hardware_ph1 = await fetchHardwarePh1();
    if (!hardware_ph1) {
      throw new Error('Hardware_ph nie został pobrany');
    }
    const hardware_ph2 = await fetchHardwarePh2();
    if (!hardware_ph2) {
      throw new Error('Hardware_ph nie został pobrany');
    }
    const crypto_ph1 = await fetchSoftwareAlgorithms();
    if (!crypto_ph1) {
      throw new Error('Hardware_ph nie został pobrany');
    }
    if (hardware_ph1 && hardware_ph2 && crypto_ph1) {
      setVrf((prev) => ({ ...prev, hardwareCrypto: { crypto_ph1: hardware_ph1, crypto_ph2: hardware_ph2 }, softwareCrypto: { crypto_ph1, crypto_ph2: crypto_ph1 } }));
    }
  };

  const fetchVrfData = async () => {
    const vrfs = await fetchData();
    if (!vrfs) {
      throw new Error('Hardware_ph nie został pobrany');
    }
    setVrf((prev) => ({ ...prev, vrfs }));
  };

  return { fetchVrfData, fetchVrfSettings, loading };
};
